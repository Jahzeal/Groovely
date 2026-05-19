import React from 'react';

export const JourneySteps = () => {
  return (
    <section className="py-32 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-black text-center mb-24 uppercase tracking-tighter">Start your journey</h2>
        <div className="grid md:grid-cols-3 gap-6 relative">
          {[
            { n: 1, title: "Create Profile", desc: "Sign up with email or connect your wallet. It takes 30 seconds." },
            { n: 2, title: "Upload or Listen", desc: "Creators upload tracks. Listeners discover new pools and discover vibes." },
            { n: 3, title: "Earn & Connect", desc: "Get paid for your plays or earn rewards for being a superfan." }
          ].map((step, i) => (
            <div key={i} className="rounded-[32px] bg-white/2 p-12 text-center relative group hover:bg-white/4 transition-all">
              <div className={`w-16 h-16 rounded-full mx-auto mb-10 flex items-center justify-center text-3xl font-black transition-all ${
                i === 2 ? 'bg-accent-purple text-white shadow-[0_0_25px_rgba(139,92,246,0.5)]' : 'bg-white/5 border border-white/10 text-white'
              }`}>
                {step.n}
              </div>
              <h4 className="text-xl font-black mb-4 uppercase tracking-tight">{step.title}</h4>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
