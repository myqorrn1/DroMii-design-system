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


import { AuthLayout, AuthLoginForm, AuthSignupForm, PasswordField } from '@dromii/react';
export function AuthTypes() {
  return <AuthLayout product="d-find" logo="D-FIND">
    <AuthLoginForm product="d-find" onGoogleSignIn={async () => {}} />
    <PasswordField label="비밀번호" autoComplete="new-password" />
  </AuthLayout>;
}
// @ts-expect-error D-FIND has no password signup form.
const unsupportedSignup = <AuthSignupForm product="d-find" onSubmit={() => {}} />;
// @ts-expect-error D-ROAD needs product-supplied verification handlers.
const missingVerification = <AuthSignupForm product="d-road" onSubmit={() => {}} />;
// @ts-expect-error D-FIND login must delegate to the Google provider.
const passwordForGoogle = <AuthLoginForm product="d-find" onSubmit={() => {}} />;
// @ts-expect-error The layout must not invent a D-FIND signup route.
const googleSignupLayout = <AuthLayout product="d-find" view="signup" logo="D-FIND">내용</AuthLayout>;
void unsupportedSignup; void missingVerification; void passwordForGoogle; void googleSignupLayout;
