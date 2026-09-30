import { useState, type FormEvent } from 'react';
import {
  Badge, Button, DataTable, FormActions, FormErrorSummary, FormGrid, FormSection,
  Icon, IconButton, Pagination, SortHeader, TableContainer, TextField, ThemeScope,
  type Brand,
} from '@dromii/react';

type SaveState = 'pristine' | 'dirty' | 'saving' | 'success' | 'error';

/** Pass a real product save function. This example does not call an API itself. */
export function CoreFormExample({ brand, onSave }: {
  brand: Brand;
  onSave: (value: { name: string }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [state, setState] = useState<SaveState>('pristine');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError('작업 이름을 입력하세요.');
      return;
    }
    setError('');
    setState('saving');
    try {
      await onSave({ name: name.trim() });
      setState('success');
    } catch {
      setState('error'); // Keep the entered value so the user can retry.
    }
  }

  const message: Record<SaveState, string> = {
    pristine: '변경 사항 없음', dirty: '저장되지 않은 변경 사항',
    saving: '저장 중', success: '저장 완료', error: '저장하지 못했습니다. 다시 시도하세요.',
  };

  return <ThemeScope brand={brand}>
    <form className="panel panel-body form" onSubmit={submit}>
      {error && <FormErrorSummary errors={[{ id: 'work-name', label: '작업 이름 입력으로 이동' }]} />}
      <FormSection title="기본 정보" description="목록에서 구분할 이름을 입력합니다.">
        <FormGrid>
          <TextField id="work-name" label="작업 이름" value={name} required
            error={error} onChange={(event) => {
              setName(event.target.value);
              setError('');
              setState('dirty');
            }} />
        </FormGrid>
      </FormSection>
      <FormActions status={{ state, message: message[state] }}>
        <Button variant="primary" type="submit" loading={state === 'saving'}>
          저장
        </Button>
      </FormActions>
    </form>
  </ThemeScope>;
}

/** The product still owns rows, sorting, paging and server errors. */
export function CoreTableExample({ brand, rows, page, pageCount, sort, onSort, onPageChange, onSearch }: {
  brand: Brand;
  rows: Array<{ id: string; name: string; status: string }>;
  page: number; pageCount: number;
  sort: 'none' | 'ascending' | 'descending';
  onSort: () => void;
  onPageChange: (page: number) => void;
  onSearch: () => void;
}) {
  return <ThemeScope brand={brand}>
    <div className="toolbar">
      <strong>작업 목록</strong>
      <IconButton label="목록 검색" onClick={onSearch}>
        <Icon name="search" size={16} />
      </IconButton>
    </div>
    <TableContainer label="작업 목록 표">
      <DataTable>
        <thead><tr><SortHeader direction={sort} onSort={onSort}>이름</SortHeader><th scope="col">상태</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id}>
          <td>{row.name}</td><td><Badge tone="neutral">{row.status}</Badge></td>
        </tr>)}</tbody>
      </DataTable>
    </TableContainer>
    <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange}
      label="작업 목록 페이지" />
  </ThemeScope>;
}
