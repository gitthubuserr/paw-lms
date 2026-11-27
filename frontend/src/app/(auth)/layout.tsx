import { APP_NAME } from '@/lib/config';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth">
      <section className="auth-panel" aria-hidden="true">
        <div className="auth-panel-inner">
          <span className="brand">{APP_NAME}</span>
          <h1>Materi, tugas, dan nilai kuliah di satu tempat.</h1>
          <p>Masuk untuk melihat kelas yang Anda ikuti atau ajar.</p>
        </div>
      </section>
      <section className="auth-form">{children}</section>
    </div>
  );
}
