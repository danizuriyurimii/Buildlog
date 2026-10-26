export default function AccountForm({ title, description, onSubmit, submitting, error, children, footer }) {
  return (
    <section className="account-view">
      <div className="account-heading">
        <p className="eyebrow">BuildLog 계정</p>
        <h1>{title}</h1>
        <p className="intro">{description}</p>
      </div>
      <form className="account-card" onSubmit={onSubmit} noValidate>
        {children}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? '처리 중…' : title}
        </button>
        {footer}
      </form>
    </section>
  );
}
