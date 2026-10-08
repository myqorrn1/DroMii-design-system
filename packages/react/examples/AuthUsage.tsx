import { AuthLayout, AuthLoginForm, AuthSignupForm, type AuthHandler, type BasicSignupValues,
  type LoginValues, type SignupValues, type EmailVerificationHandlers } from '@dromii/react';
import '@dromii/react/styles.css';

// Product assets, routes, API responses and policy documents are supplied by the product.
export function KAquasLogin({ logoUrl, login }: { logoUrl: string; login: AuthHandler<LoginValues> }) {
  return <AuthLayout product="k-aquas" logo={<img className="auth-brand" src={logoUrl} alt="K-AQUAS" />}
    switchAction={<>계정이 없으신가요?<a className="auth-link" href="/signup">회원가입</a></>}>
    <AuthLoginForm product="k-aquas" onSubmit={login} />
  </AuthLayout>;
}
export function KAquasSignup({ logoUrl, companies, signup, openPolicy }: {
  logoUrl: string; companies: Array<{ value: string; label: string }>;
  signup: AuthHandler<SignupValues>; openPolicy: (policy: 'privacy' | 'terms' | 'marketing') => void;
}) {
  return <AuthLayout product="k-aquas" view="signup"
    logo={<img className="auth-brand" src={logoUrl} alt="K-AQUAS" />}
    switchAction={<>이미 계정이 있으신가요?<a className="auth-link" href="/login">로그인</a></>}>
    <AuthSignupForm product="k-aquas" companyOptions={companies} onSubmit={signup} onPolicyOpen={openPolicy} />
  </AuthLayout>;
}
export function DRoadLogin({ logoUrl, login }: { logoUrl: string; login: AuthHandler<LoginValues> }) {
  return <AuthLayout product="d-road" logo={<img className="auth-brand" src={logoUrl} alt="D-ROAD" />}
    switchAction={<>계정이 없으신가요?<a className="auth-link" href="/signup">회원가입</a></>}>
    <AuthLoginForm product="d-road" onSubmit={login}
      forgotPasswordAction={<a className="auth-link" href="/forgot-password">비밀번호 찾기</a>} />
  </AuthLayout>;
}
export function DRoadSignup({ logoUrl, signup, verification, openPolicy }: {
  logoUrl: string; signup: AuthHandler<SignupValues>; verification: EmailVerificationHandlers;
  openPolicy: (policy: 'privacy' | 'terms' | 'marketing') => void;
}) {
  return <AuthLayout product="d-road" view="signup"
    logo={<img className="auth-brand" src={logoUrl} alt="D-ROAD" />}
    switchAction={<>이미 계정이 있으신가요?<a className="auth-link" href="/login">로그인</a></>}>
    <AuthSignupForm product="d-road" onSubmit={signup} verification={verification} onPolicyOpen={openPolicy} />
  </AuthLayout>;
}
// D-FIND: 가입 신청 뒤 로그인으로 돌아오면 라우트 상태의 이메일과 승인 안내를 넘긴다.
export function DFindLogin({ logoUrl, login, registeredEmail }: {
  logoUrl: string; login: AuthHandler<LoginValues>; registeredEmail?: string;
}) {
  return <AuthLayout product="d-find" logo={<img className="auth-brand" src={logoUrl} alt="D-FIND" />}
    switchAction={<>계정이 없나요?<a className="auth-link" href="/register">회원가입</a></>}>
    <AuthLoginForm product="d-find" onSubmit={login} defaultEmail={registeredEmail}
      notice={registeredEmail ? { title: '가입 신청이 완료되었습니다',
        message: '관리자 승인 후 로그인할 수 있습니다.' } : undefined} />
  </AuthLayout>;
}
export function DFindSignup({ logoUrl, register }: {
  logoUrl: string; register: AuthHandler<BasicSignupValues>;
}) {
  return <AuthLayout product="d-find" view="signup" logo={<img className="auth-brand" src={logoUrl} alt="D-FIND" />}
    switchAction={<>이미 계정이 있나요?<a className="auth-link" href="/login">로그인</a></>}>
    <AuthSignupForm product="d-find" onSubmit={register} />
  </AuthLayout>;
}
