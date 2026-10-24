
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Users, ArrowRight } from "lucide-react";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.token || res.data.data?.token;

      if (!token) throw new Error("Login token response mein nahi mila.");

      localStorage.setItem("token", token);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="brand">
          <div className="brand-icon"><Users size={23} /></div>
          <span>HCM<span className="brand-light"> Lite</span></span>
        </div>

        <div className="visual-content">
          <span className="eyebrow">PEOPLE FIRST. WORK SMARTER.</span>
          <h1>Your people.<br />One powerful<br /><span>workspace.</span></h1>
          <p>Manage your workforce, attendance, leave and payroll in one simple place.</p>

          <div className="visual-feature">
            <div className="feature-icon"><ShieldCheck size={21} /></div>
            <div>
              <strong>Secure workforce management</strong>
              <p>One workspace for your entire organization.</p>
            </div>
          </div>
        </div>

        <div className="visual-footer">HCM Lite · Human Capital Management</div>
      </section>

      <section className="auth-panel">
        <div className="mobile-brand">
          <div className="brand-icon"><Users size={22} /></div>
          <strong>HCM Lite</strong>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-tag">YOUR WORKSPACE</div>
          <h2>Welcome back</h2>
          <p className="form-description">Sign in to access your organization.</p>

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-label">
            <label htmlFor="password">Password</label>
          </div>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <button className="auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in to workspace"}
            {!loading && <ArrowRight size={18} />}
          </button>

          <div className="auth-divider"><span>NEW TO HCM LITE?</span></div>

          <Link className="secondary-link" to="/setup">
            Set up your company <ArrowRight size={16} />
          </Link>

          <p className="security-note">
            <ShieldCheck size={15} /> Secure access to your organization
          </p>
        </form>

        <footer className="panel-footer">© HCM Lite · Workforce management made simple</footer>
      </section>
    </main>
  );
}
