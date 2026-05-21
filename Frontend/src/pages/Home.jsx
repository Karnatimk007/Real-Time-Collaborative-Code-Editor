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
      <div className="home-mockup-wrapper">
        <div className="code-mockup">
          <div className="mockup-header">
            <div className="dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="mockup-title">create_account.js</span>
          </div>
          <div className="mockup-body">
            <pre><code>
<span className="keyword">import</span> {"{"} CodeSync {"}"} <span className="keyword">from</span> <span className="string">'@codesync/core'</span>;

<span className="keyword">const</span> session <span className="operator">=</span> <span className="keyword">await</span> CodeSync.<span className="function">createSession</span>({"{"}
  projectId: <span className="string">'global-collab'</span>,
  features: [<span className="string">'pair-programming'</span>, <span className="string">'live-chat'</span>]
{"}"});

session.<span className="function">on</span>(<span className="string">'userJoin'</span>, (user) <span className="operator">=&gt;</span> {"{"}
  <span className="object">console</span>.<span className="function">log</span>(<span className="string">`User `</span> + user.name + <span className="string">` joined`</span>);
{"}"});
            </code></pre>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Home;