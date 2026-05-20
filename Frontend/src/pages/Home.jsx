import "../index.css";

function Home() {

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="badge">soon with Gemini AI Integration 🚀</div>
        
        <h1 className="hero-title">
          Code Together, <span className="text-gradient">Build Faster</span>
        </h1>
        
        <p className="hero-subtitle">
          Real-time collaborative code editor for developers. Sync, share,
          and ship your projects from anywhere in the world.
        </p>

    

     

        <div className="code-mockup card">
          <div className="mockup-header">
            <div className="dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="mockup-title">main.js — CodeSync Editor</span>
          </div>
          <div className="mockup-body">
            <pre><code>
<span className="keyword">const</span> room <span className="operator">=</span> <span className="string">"CodeSync"</span>;
<span className="keyword">function</span> <span className="function">startSession</span>() {"{"}
  <span className="object">console</span>.<span className="function">log</span>(<span className="string">"Collaboration started 🚀"</span>);
{"}"}
            </code></pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;