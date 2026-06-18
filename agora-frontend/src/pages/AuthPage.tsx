import fundoLivro from '@/assets/livro-coluna.png';
import logoIcon from '@/assets/logo-icon.png';
import { useAuthForm } from '@/features/auth/hooks/useAuthForm';
import LoginPanel from '@/features/auth/components/LoginPanel';
import RegisterPanel from '@/features/auth/components/RegisterPanel';
import AuthOverlayPanel from '@/features/auth/components/AuthOverlayPanel';

const AuthPage = () => {
  const {
    isLogin,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginRoleTab,
    setRoleTab,
    formData,
    setFormData,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    error,
    success,
    loading,
    handleLogin,
    handleRegisterChange,
    handleRegister,
    switchMode,
  } = useAuthForm();

  return (
    <div
      className='min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: `url(${fundoLivro})` }}
    >
      <div className='mb-6 relative z-10'>
        <img src={logoIcon} alt='Ágora' className='h-20 drop-shadow-lg' />
      </div>

      <div className='relative z-10 w-full max-w-[900px] h-[650px] bg-white rounded-xl shadow-2xl overflow-hidden flex'>
        <LoginPanel
          isLogin={isLogin}
          loginEmail={loginEmail}
          loginPassword={loginPassword}
          loginRoleTab={loginRoleTab}
          showPassword={showPassword}
          error={error}
          loading={loading}
          onEmailChange={setLoginEmail}
          onPasswordChange={setLoginPassword}
          onRoleChange={setRoleTab}
          onTogglePassword={() => setShowPassword((s) => !s)}
          onSubmit={handleLogin}
          onSwitchToRegister={() => switchMode(false)}
        />

        <RegisterPanel
          isLogin={isLogin}
          formData={formData}
          confirmPassword={confirmPassword}
          showPassword={showPassword}
          error={error}
          success={success}
          loading={loading}
          onFieldChange={handleRegisterChange}
          onConfirmPasswordChange={setConfirmPassword}
          onRoleChange={(role) => setFormData({ ...formData, roleType: role })}
          onTogglePassword={() => setShowPassword((s) => !s)}
          onSubmit={handleRegister}
          onSwitchToLogin={() => switchMode(true)}
        />

        <AuthOverlayPanel
          isLogin={isLogin}
          onSwitchToLogin={() => switchMode(true)}
          onSwitchToRegister={() => switchMode(false)}
        />
      </div>
    </div>
  );
};

export default AuthPage;
