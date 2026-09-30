import { Button, Dialog, TextField, ThemeScope, Tabs } from '@dromii/react';

export function Usage() {
  return <ThemeScope brand="d-road" scheme="dark">
    <TextField label="작업 이름" error="필수입니다" />
    <Button variant="primary" loading>저장</Button>
    <Tabs selected="map" onChange={(id: string) => { void id; }}
      items={[{ id: 'map', label: '지도', content: '지도 자료' }]} />
    <Dialog open={false} onClose={() => {}} title="확인" description="작업 결과" />
  </ThemeScope>;
}
