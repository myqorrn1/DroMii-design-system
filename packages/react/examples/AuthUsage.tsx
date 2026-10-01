import { AuthLayout, AuthLoginForm, AuthSignupForm, type AuthHandler,
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
export function DFindLogin({ logoUrl, googleIcon, signIn }: {
  logoUrl: string; googleIcon: React.ReactNode;
  signIn: () => Promise<void>;
}) {
  return <AuthLayout product="d-find" logo={<img className="auth-brand" src={logoUrl} alt="D-FIND" />}>
    <AuthLoginForm product="d-find" onGoogleSignIn={signIn} googleIcon={googleIcon}
      policyActions={<><a className="auth-link" href="/terms">이용약관</a>
        <a className="auth-link" href="/privacy">개인정보 처리방침</a></>} />
  </AuthLayout>;
}
