import { ArrowLeft, ArrowRight, Library } from 'lucide-react';

type AuthOverlayPanelProps = {
  isLogin: boolean;
  onSwitchToLogin: () => void;
  onSwitchToRegister: () => void;
};

const AuthOverlayPanel = ({ isLogin, onSwitchToLogin, onSwitchToRegister }: AuthOverlayPanelProps) => (
  <div
    className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full bg-[#2b353a] z-20 transition-transform duration-700 ease-in-out shadow-2xl ${
      !isLogin ? '-translate-x-full' : 'translate-x-0'
    }`}
  >
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center p-12 text-center transition-all duration-500 ${
        isLogin ? 'opacity-100 delay-300' : 'opacity-0 pointer-events-none'
      }`}
    >
      <Library className="w-16 h-16 text-white mb-6" strokeWidth={1.5} />
      <h2 className="text-3xl font-semibold text-[#18915b] mb-4">Ainda não tem conta?</h2>
      <p className="text-gray-300 mb-8 leading-relaxed max-w-sm">
        Registre-se agora e comece a compartilhar seus projetos com a comunidade acadêmica.
      </p>
      <button
        onClick={onSwitchToRegister}
        className="px-8 py-3 bg-white text-gray-900 rounded font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
      >
        Registre-se aqui <ArrowRight className="w-4 h-4" />
      </button>
    </div>

    <div
      className={`absolute inset-0 flex flex-col items-center justify-center p-12 text-center transition-all duration-500 ${
        !isLogin ? 'opacity-100 delay-300' : 'opacity-0 pointer-events-none'
      }`}
    >
      <Library className="w-16 h-16 text-white mb-6" strokeWidth={1.5} />
      <h2 className="text-3xl font-semibold text-[#18915b] mb-4">Já possui uma conta?</h2>
      <p className="text-gray-300 mb-8 leading-relaxed max-w-sm">
        Entre agora para acessar seus projetos e a comunidade acadêmica do Ágora.
      </p>
      <button
        onClick={onSwitchToLogin}
        className="px-8 py-3 bg-white text-gray-900 rounded font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Entrar aqui
      </button>
    </div>
  </div>
);

export default AuthOverlayPanel;
