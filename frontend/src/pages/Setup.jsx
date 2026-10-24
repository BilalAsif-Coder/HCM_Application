
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, UserRound, Mail, LockKeyhole, ArrowRight, ShieldCheck, Users } from "lucide-react";
import api from "../api/axios";
import "./Setup.css";

export default function Setup() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/setup", {
        companyName,
        name,
        email,
        password,
      });

      const token = res.data.token || res.data.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Company setup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="setup-page">
      <section className="setup-visual">
        <div className="setup-brand">
          <div className="setup-brand-icon"><Users size={23} /></div>
          <span>HCM <b>Lite</b></span>
        </div>

        <div className="setup-visual-content">
          <span className="setup-eyebrow">GET YOUR TEAM STARTED</span>
          <h1>Build your<br />workplace.<br /><span>Start here.</span></h1>
          <p>Create your organization workspace and set up your administrator account.</p>

          <div className="setup-benefit">
            <ShieldCheck size={22} />
            <div>
              <strong>Your organization, one place</strong>
              <p>Start managing your workforce with HCM Lite.</p>
            </div>
          </div>
        </div>

        <div className="setup-visual-footer">
          HCM Lite · Human Capital Management
        </div>
      </section>

      <section className="setup-panel">
        <div className="setup-mobile-brand">
          <div className="setup-brand-icon"><Users size={22} /></div>
          <strong>HCM Lite</strong>
        </div>

        <form className="setup-form" onSubmit={handleSubmit}>
          <div className="setup-tag">INITIAL CONFIGURATION</div>
          <h2>Set up your company</h2>
          <p className="setup-description">
            Create your workspace and administrator account.
          </p>

          <label htmlFor="companyName">Company name</label>
          <div className="setup-input-wrap">
            <Building2 size={18} />
            <input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your organization name"
              required
            />
          </div>

          <label htmlFor="adminName">Administrator name</label>
          <div className="setup-input-wrap">
            <UserRound size={18} />
            <input
              id="adminName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoComplete="name"
              required
            />
          </div>

          <label htmlFor="setupEmail">Work email</label>
          <div className="setup-input-wrap">
            <Mail size={18} />
            <input
              id="setupEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="setupPassword">Password</label>
          <div className="setup-input-wrap">
            <LockKeyhole size={18} />
            <input
              id="setupPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {error && <div className="setup-error">{error}</div>}

          <button className="setup-submit" disabled={loading}>
            {loading ? "Setting up..." : "Create company workspace"}
            {!loading && <ArrowRight size={18} />}
          </button>

          <div className="setup-divider"><span>ALREADY SET UP?</span></div>

          <Link className="setup-login-link" to="/login">
            Back to sign in <ArrowRight size={16} />
          </Link>

          <p className="setup-security">
            <ShieldCheck size={15} /> Secure administrator access
          </p>
        </form>

        <footer className="setup-panel-footer">
          © HCM Lite · Workforce management made simple
        </footer>
      </section>
    </main>
  );
}
