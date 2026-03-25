import React from 'react';

export const JourneySteps = () => {
  return (
    <section className="py-32 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-black text-center mb-24 uppercase tracking-tighter">Start your journey</h2>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -z-10 hidden md:block" />
          {[
            { n: 1, title: "Create Profile", desc: "Sign up with email or connect your wallet. It takes 30 seconds." },
            { n: 2, title: "Upload or Listen", desc: "Creators upload tracks. Listeners discover new beats and vibes." },
            { n: 3, title: "Earn & Connect", desc: "Get paid for your plays or earn credits for being a superfan." }
          ].map((step, i) => (
            <div key={i} className="glass-card p-12 text-center relative group hover:border-accent-cyan/30 transition-all">
              <div className={`w-16 h-16 rounded-full mx-auto mb-10 flex items-center justify-center text-3xl font-black transition-all border shadow-lg ${
                i === 2 ? 'bg-accent-cyan border-accent-cyan text-black scale-110 glow-cyan' : 'bg-zinc-900 border-white/10 text-white'
              }`}>
                {step.n}
              </div>
              <h4 className="text-2xl font-black mb-6 uppercase tracking-tight">{step.title}</h4>
              <p className="text-zinc-500 text-md leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
