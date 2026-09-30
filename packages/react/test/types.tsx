import { BarChart, Badge, Button, Dialog, FormActions, FormErrorSummary,
  Icon, IconButton, TextField, ThemeScope, Tabs, Toast, ToastRegion } from '@dromii/react';

export function Usage() {
  return <ThemeScope brand="d-road" scheme="dark">
    <TextField label="작업 이름" error="필수입니다" />
    <Button variant="primary" loading>저장</Button>
    <IconButton size="xs" label="닫기"><Icon name="close" size={12} /></IconButton>
    <Badge tone="success" dot>완료</Badge>
    <FormErrorSummary errors={[{ id: 'project-name', label: '프로젝트명 확인' }]} />
    <FormActions sticky status={{ state: 'dirty', message: '저장되지 않음' }} />
    <ToastRegion><Toast title="저장 완료">목록에 반영됐습니다.</Toast></ToastRegion>
    <BarChart label="A 48건" items={[{ label: 'A 구간', value: 48, valueLabel: '48건' }]} />
    <Tabs selected="map" onChange={(id: string) => { void id; }}
      items={[{ id: 'map', label: '지도', content: '지도 자료' }]} />
    <Dialog open={false} onClose={() => {}} title="확인" description="작업 결과" />
  </ThemeScope>;
}
