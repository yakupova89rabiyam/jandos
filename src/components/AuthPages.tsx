import React, { useState, useRef } from 'react';
import { authApi } from '../api/client';

const AuthLogo = () => (
  <div className="flex flex-col items-center mb-10">
    <div className="w-[100px] h-[100px] rounded-full border-[2px] border-[#1A1A1A] flex items-center justify-center overflow-hidden bg-white mb-4">
      <svg width="60" height="60" viewBox="0 0 24 24" fill="#1A1A1A">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
    </div>
    <div className="text-[36px] font-bold text-[#6052B3] leading-none tracking-tight font-serif">JanDós</div>
    <div className="text-[14px] text-[#888888] font-medium mt-1">приют для животных</div>
  </div>
);

const Input = ({ label, id, placeholder, type = "text", value, onChange, error, required = false }: any) => (
  <div className="w-full mb-4">
    <label htmlFor={id} className="block text-[14px] font-medium text-[#1A1A1A] mb-1.5 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      aria-invalid={error ? "true" : "false"}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`w-full border ${error ? 'border-red-500' : 'border-[#6052B3]'} rounded-[12px] px-5 py-4 text-[15px] text-[#1A1A1A] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#6052B3] bg-transparent transition-all`}
    />
    {error && (
      <p id={`${id}-error`} className="text-red-500 text-[12px] mt-1 ml-1" role="alert">
        {error}
      </p>
    )}
  </div>
);

const Button = ({ children, onClick, type = "button", className = "", disabled = false }: any) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`w-full bg-[#6052B3] text-white rounded-[12px] py-4 text-[16px] font-medium hover:bg-[#4A3E90] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

export const LoginPage = ({ onLogin, onNavigate }: { onLogin: (token: string, user: any) => void, onNavigate: (page: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: any = {};
    if (!email) newErrors.email = 'Пожалуйста, введите email';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Введите корректный email';
    
    if (!password) newErrors.password = 'Пожалуйста, введите пароль';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { token, user } = await authApi.login(email, password);
      onLogin(token, user);
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F9F9F9] px-4 py-12">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        <AuthLogo />
        <h1 className="text-[24px] font-medium text-[#1A1A1A] mb-8">Укажите ваши данные</h1>
        
        <form className="w-full" onSubmit={handleLogin}>
          <Input 
            label="Email"
            id="login-email"
            placeholder="example@mail.com" 
            type="email" 
            value={email} 
            onChange={(e: any) => { setEmail(e.target.value); setErrors({}); }}
            error={errors.email}
            required
          />
          <Input 
            label="Пароль"
            id="login-password"
            placeholder="••••••••" 
            type="password" 
            value={password} 
            onChange={(e: any) => { setPassword(e.target.value); setErrors({}); }}
            error={errors.password}
            required
          />
          
          {errors.form && <p className="text-red-500 text-sm mb-4 text-center" role="alert">{errors.form}</p>}
          
          <div className="flex justify-center mb-8">
            <button 
              type="button"
              onClick={() => onNavigate('forgot-password-email')}
              className="text-[#1A1A1A] text-[14px] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#6052B3] rounded-sm"
            >
              Забыли пароль?
            </button>
          </div>
          
          <Button type="submit">Войти</Button>
          
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => onNavigate('register')}
              className="text-[#6052B3] text-[14px] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#6052B3] rounded-sm"
            >
              Нет аккаунта? Зарегистрироваться
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const RegisterPage = ({ onLogin, onNavigate }: { onLogin?: (token: string, user: any) => void, onNavigate: (page: string) => void }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: any = {};
    if (!email) newErrors.email = 'Пожалуйста, введите email';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Введите корректный email';
    
    if (!name) newErrors.name = 'Пожалуйста, введите ваше имя';
    
    if (!password) newErrors.password = 'Пожалуйста, придумайте пароль';
    else if (password.length < 6) newErrors.password = 'Пароль должен быть не менее 6 символов';
    
    if (!confirmPassword) newErrors.confirmPassword = 'Пожалуйста, повторите пароль';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await authApi.register(email, name, password);
      if (onLogin) {
        onLogin(data.token, data.user);
      } else {
        onNavigate('login');
      }
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F9F9F9] px-4 py-12">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        <AuthLogo />
        <h1 className="text-[24px] font-medium text-[#1A1A1A] mb-8">Заполните ваши данные</h1>
        
        <form className="w-full" onSubmit={handleRegister}>
          <Input 
            label="Почта"
            id="reg-email"
            placeholder="example@mail.com" 
            type="email" 
            value={email} 
            onChange={(e: any) => { setEmail(e.target.value); setErrors({}); }}
            error={errors.email}
            required
          />
          <Input 
            label="Имя"
            id="reg-name"
            placeholder="Ваше имя" 
            value={name} 
            onChange={(e: any) => { setName(e.target.value); setErrors({}); }}
            error={errors.name}
            required
          />
          <Input 
            label="Придумайте пароль"
            id="reg-password"
            placeholder="••••••••" 
            type="password" 
            value={password} 
            onChange={(e: any) => { setPassword(e.target.value); setErrors({}); }}
            error={errors.password}
            required
          />
          <Input 
            label="Повторите пароль"
            id="reg-confirm"
            placeholder="••••••••" 
            type="password" 
            value={confirmPassword} 
            onChange={(e: any) => { setConfirmPassword(e.target.value); setErrors({}); }}
            error={errors.confirmPassword}
            required
          />
          
          <div className="mt-4">
            {errors.form && <p className="text-red-500 text-sm mb-4 text-center" role="alert">{errors.form}</p>}
            <Button type="submit" disabled={loading}>{loading ? 'Регистрация...' : 'Зарегистрироваться'}</Button>
          </div>
          
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => onNavigate('login')}
              className="text-[#6052B3] text-[14px] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#6052B3] rounded-sm"
            >
              Уже есть аккаунт? Войти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ForgotPasswordEmailPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Пожалуйста, введите email'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Введите корректный email'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      if (res.code) {
        sessionStorage.setItem('reset_email', email);
        setCode(res.code);
      } else {
        // email not found — don't reveal, just show generic message
        setCode('????');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F9F9F9] px-4 py-12">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        <AuthLogo />
        <h1 className="text-[24px] font-medium text-[#1A1A1A] mb-8 text-center">Восстановление пароля</h1>

        {code ? (
          <div className="w-full text-center">
            <div className="w-16 h-16 bg-[#6052B3]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6052B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 11.5 19.79 19.79 0 0 1 1.08 2.83 2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
              </svg>
            </div>
            <p className="text-[16px] font-medium text-[#1A1A1A] mb-1">Код отправлен</p>
            <p className="text-[13px] text-[#888888] mb-4">Ваш код подтверждения:</p>
            <div className="bg-[#6052B3]/10 border border-[#6052B3]/30 rounded-[12px] px-6 py-4 mb-6 inline-block">
              <span className="text-[32px] font-bold text-[#6052B3] tracking-[0.3em]">{code}</span>
            </div>
            <div className="w-full">
              <Button onClick={() => onNavigate('forgot-password-code')}>Ввести код</Button>
            </div>
            <div className="mt-4 text-center">
              <button type="button" onClick={() => onNavigate('login')} className="text-[#6052B3] text-[14px] font-medium hover:underline">
                Вернуться ко входу
              </button>
            </div>
          </div>
        ) : (
          <form className="w-full" onSubmit={handleSendCode}>
            <Input
              label="Email"
              id="forgot-email"
              placeholder="example@mail.com"
              type="email"
              value={email}
              onChange={(e: any) => { setEmail(e.target.value); setError(''); }}
              error={error}
              required
            />
            <div className="mt-4">
              <Button type="submit" disabled={loading}>{loading ? 'Отправка...' : 'Получить код'}</Button>
            </div>
            <div className="mt-6 text-center">
              <button type="button" onClick={() => onNavigate('login')} className="text-[#6052B3] text-[14px] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#6052B3] rounded-sm">
                Вернуться ко входу
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const ForgotPasswordCodePage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      setError('');
      if (value.length === 1 && index < 3) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 4) { setError('Введите все 4 цифры кода'); return; }

    const email = sessionStorage.getItem('reset_email');
    if (!email) { setError('Сессия истекла. Начните заново.'); return; }

    setLoading(true);
    try {
      const { token } = await authApi.verifyCode(email, fullCode);
      sessionStorage.setItem('reset_token', token);
      onNavigate('forgot-password-new');
    } catch (err: any) {
      setError(err.message);
      setCode(['', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F9F9F9] px-4 py-12">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        <AuthLogo />
        <h1 className="text-[24px] font-medium text-[#1A1A1A] mb-2 text-center">Введите код</h1>
        <p className="text-[14px] text-[#888888] text-center mb-6">Введите 4-значный код, который вы получили на предыдущем шаге</p>

        <form className="w-full" onSubmit={handleVerify}>
          <div className="w-full flex justify-center gap-4 mb-4 mt-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <label htmlFor={`code-${i}`} className="sr-only">Цифра {i + 1}</label>
                <input
                  id={`code-${i}`}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={code[i]}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-[60px] h-[60px] border border-[#6052B3] rounded-[12px] text-center text-[24px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#6052B3] bg-transparent"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mb-4 text-center" role="alert">{error}</p>}

          <div className="w-full flex flex-col gap-3 mt-4">
            <Button type="submit" disabled={loading}>{loading ? 'Проверка...' : 'Подтвердить'}</Button>
            <button
              type="button"
              onClick={() => onNavigate('forgot-password-email')}
              className="w-full border border-[#6052B3] text-[#6052B3] rounded-[12px] py-4 text-[14px] font-medium hover:bg-[#6052B3] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#6052B3]"
            >
              Запросить новый код
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ForgotPasswordNewPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: any = {};
    if (!password) newErrors.password = 'Пожалуйста, придумайте пароль';
    else if (password.length < 6) newErrors.password = 'Пароль должен быть не менее 6 символов';
    if (!confirmPassword) newErrors.confirmPassword = 'Пожалуйста, повторите пароль';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const token = sessionStorage.getItem('reset_token');
    if (!token) {
      setErrors({ form: 'Сессия истекла. Начните процесс заново.' });
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      sessionStorage.removeItem('reset_email');
      sessionStorage.removeItem('reset_token');
      onNavigate('login');
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F9F9F9] px-4 py-12">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        <AuthLogo />
        <h1 className="text-[24px] font-medium text-[#1A1A1A] mb-8">Новый пароль</h1>

        <form className="w-full" onSubmit={handleSave}>
          <Input
            label="Придумайте пароль"
            id="new-password"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e: any) => { setPassword(e.target.value); setErrors({}); }}
            error={errors.password}
            required
          />
          <Input
            label="Повторите пароль"
            id="new-confirm"
            placeholder="••••••••"
            type="password"
            value={confirmPassword}
            onChange={(e: any) => { setConfirmPassword(e.target.value); setErrors({}); }}
            error={errors.confirmPassword}
            required
          />

          {errors.form && <p className="text-red-500 text-sm mb-4 text-center" role="alert">{errors.form}</p>}

          <div className="mt-4">
            <Button type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить и войти'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
