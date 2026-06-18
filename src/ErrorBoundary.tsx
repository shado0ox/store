import React, { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-right rtl-grid font-sans" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-3xl border border-gray-150 p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <AlertOctagon size={32} />
              </div>
              <h2 className="text-xl font-black text-gray-900">عذراً، حدث خطأ غير متوقع! ⚠️</h2>
              <p className="text-xs text-gray-550 leading-relaxed">
                واجه النظام مشكلة مؤقتة في تحميل هذه الصفحة. لا تقلق، تم تسجيل التفاصيل لمراجعتها وتأمين المزامنة.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/60 font-mono text-[10px] text-red-600 text-left overflow-auto max-h-32 select-all">
                {this.state.error.toString()}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 bg-amber-500 hover:bg-amber-650 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
                إعادة تحميل الصفحة
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home size={14} />
                الصفحة الرئيسية
              </button>
            </div>

            <div className="text-center text-[10px] text-gray-400 font-semibold pt-2 border-t border-gray-100">
              خطوات الأناقة &copy; {new Date().getFullYear()} - ربط سحابي آمن ومستدام
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
