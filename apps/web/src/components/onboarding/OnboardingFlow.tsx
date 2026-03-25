'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { SelectionCard } from './SelectionCard';
import { WalletCard } from './WalletCard';

export const MetaMaskIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-16 h-16" />
);

export const WalletConnectIcon = () => (
  <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#3B99FC"/>
    <path d="M72.2965 37.6433C60.0384 25.4309 40.1037 25.4309 27.8455 37.6433C27.1353 38.3506 27.1353 39.4975 27.8455 40.2048L32.1472 44.4905C32.4938 44.8358 33.0558 44.8358 33.4024 44.4905C42.548 35.3789 57.3826 35.3789 66.5283 44.4905C66.8749 44.8358 67.4368 44.8358 67.7834 44.4905L72.0851 40.2048C72.7954 39.4975 72.7954 38.3506 72.2965 37.6433Z" fill="white"/>
    <path d="M84.7679 49.9868C79.4673 44.7061 70.8388 44.7061 65.5381 49.9868C65.1915 50.3321 65.1915 50.8919 65.5381 51.2372L69.8398 55.523C70.5501 56.2302 70.5501 57.3771 69.8398 58.0844C66.3688 61.5425 60.7138 61.5425 57.2427 58.0844L52.8872 53.7449C51.2721 52.1357 48.6586 52.1357 47.0434 53.7449L42.6879 58.0844C39.2168 61.5425 33.5619 61.5425 30.0908 58.0844C29.3806 57.3771 29.3806 56.2302 30.0908 55.523L34.3925 51.2372C34.7391 50.8919 34.7391 50.3321 34.3925 49.9868C29.0919 44.7061 20.4633 44.7061 15.1627 49.9868C14.4524 50.6941 14.4524 51.841 15.1627 52.5483L25.9613 63.3067C31.2503 68.5759 39.8143 68.5759 45.1033 63.3067L49.07 59.3547C49.569 58.8576 50.3805 58.8576 50.8795 59.3547L54.8462 63.3067C60.1352 68.5759 68.6993 68.5759 73.9883 63.3067L84.7869 52.5483C85.4971 51.841 85.4971 50.6941 84.7679 49.9868Z" fill="white"/>
  </svg>
);

export const PhantomIcon = () => (
  <svg width="64" height="64" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="32" fill="#AB9FF2"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M47.7923 93L47.7818 92.9897L47.7288 92.9376L47.7923 83.25V47.5C47.7923 45.4289 49.4712 43.75 51.5423 43.75H73.0423C85.5898 43.75 95.7923 53.9525 95.7923 66.5V93L87.7923 85L79.7923 93L71.7923 85L63.7923 93L55.7923 85L47.7923 93ZM81.5423 58.75C81.5423 61.5114 79.3037 63.75 76.5423 63.75C73.7809 63.75 71.5423 61.5114 71.5423 58.75C71.5423 55.9886 73.7809 53.75 76.5423 53.75C79.3037 53.75 81.5423 55.9886 81.5423 58.75ZM66.5423 58.75C66.5423 61.5114 64.3037 63.75 61.5423 63.75C58.7809 63.75 56.5423 61.5114 56.5423 58.75C56.5423 55.9886 58.7809 53.75 61.5423 53.75C64.3037 53.75 66.5423 55.9886 66.5423 58.75Z" fill="white"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const SoundCloudIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.53 11v6c0 .54-.45 1-1.01 1-.56 0-1.02-.46-1.02-1v-6c0-.52.46-.95 1.02-.95.56 0 1.01.43 1.01.95zm-2.93-1.6c.55 0 1 .42 1 .94v7.6c0 .53-.45.95-1 .95s-1-.42-1-.95v-7.6c0-.52.45-.94 1-.94zm-2.82 2.6c.53 0 .96.42.96.95v4.56c0 .54-.43.96-.96.96-.53 0-.97-.42-.97-.96v-4.56c0-.53.44-.95.97-.95zm14.86-.3c.4 0 .76.15 1.05.4.3.26.49.63.49 1.04v1.89c0 .41-.19.78-.49 1.04-.29.25-.65.4-1.05.4H10.42v-5.6h1.2v-2.3c0-.3.26-.54.58-.54.3 0 .58.24.58.54v2.3h1.2s.22-3.32 1.46-3.32c.5 0 .95.2 1.33.53.5-.66 1.34-1.12 2.29-1.12 1.54 0 2.8 1.14 2.8 2.54v.9h.8zM2.87 13.9c.52 0 .95.42.95.95v1.44c0 .53-.43.95-.95.95s-.95-.42-.95-.95v-1.44c0-.52.43-.95.95-.95Z" />
  </svg>
);

const UserIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);

export const OnboardingFlow = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'creator' | 'listener' | null>(null);
  const [wallet, setWallet] = useState<'metamask' | 'walletconnect' | 'phantom' | null>(null);

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] relative flex flex-col">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-purple/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex w-full items-center justify-between px-12 py-6">
        <Logo />
        <div className="flex items-center gap-6">
          <span className="text-zinc-400 text-sm font-medium hidden sm:inline">Already have an account?</span>
          <button className="bg-accent-purple text-white px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all">
            Log In
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-4 pt-2 pb-12 relative z-10 w-full">
        <div className={`w-full ${step === 4 ? 'max-w-[900px] p-6 md:p-8' : 'max-w-[640px] p-8 sm:p-10'} bg-black/40 backdrop-blur-2xl rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden mb-12 transition-all duration-500`}>
          {/* Subtle Background Inner Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-purple/5 blur-[80px] rounded-full" />

          {/* Back Button */}
          {step < 4 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </button>
          )}

          {step === 1 && (
            <>
              {/* Header */}
              <div className="flex flex-col items-center mb-10">
                <ProgressBar currentStep={1} totalSteps={3} />
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-8 mb-4 text-center">
                  How will you groove with us?
                </h1>
                <p className="text-zinc-400 text-lg font-medium text-center">
                  Choose your path to get the best experience on Groovely
                </p>
              </div>

              {/* Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <SelectionCard
                  title="I'm a Creator"
                  imageSrc="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  isSelected={role === 'creator'}
                  onSelect={() => setRole('creator')}
                />
                <SelectionCard
                  title="I'm a Listener/Fan"
                  imageSrc="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  isSelected={role === 'listener'}
                  onSelect={() => setRole('listener')}
                />
              </div>

              {/* Continue Button */}
              <div className="space-y-6">
                <Button fullWidth onClick={() => setStep(2)} disabled={!role}>
                  Continue
                </Button>
                <p className="text-zinc-500 text-sm font-medium text-center">
                  Not sure yet? You can switch roles later.
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Header */}
              <div className="flex flex-col items-center mb-10">
                <ProgressBar currentStep={2} totalSteps={3} />
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-8 mb-4 text-center">
                  Connect your wallet to Groovely
                </h1>
                <p className="text-zinc-400 text-lg font-medium text-center">
                  Choose a wallet to connect to Groovely
                </p>
              </div>

              {/* Wallet Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <WalletCard
                  name="MetaMask"
                  icon={<MetaMaskIcon />}
                  isSelected={wallet === 'metamask'}
                  onSelect={() => setWallet('metamask')}
                />
                <WalletCard
                  name="WalletConnect"
                  icon={<WalletConnectIcon />}
                  isSelected={wallet === 'walletconnect'}
                  onSelect={() => setWallet('walletconnect')}
                />
                <WalletCard
                  name="Phantom"
                  icon={<PhantomIcon />}
                  isSelected={wallet === 'phantom'}
                  onSelect={() => setWallet('phantom')}
                />
              </div>

              {/* Connect Button */}
              <div className="space-y-6">
                <Button fullWidth onClick={() => setStep(3)} disabled={!wallet}>
                  Connect
                </Button>
                <p className="text-zinc-500 text-sm font-medium text-center">
                  Reassurance/helper text
                </p>
              </div>

              {/* Footer Terms */}
              <div className="flex justify-between mt-12 text-[#80808a] text-xs px-2">
                <span className="cursor-pointer hover:text-white transition-colors">Terms & Conditions</span>
                <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <ProgressBar currentStep={3} totalSteps={3} />
                <h1 className="text-[28px] md:text-3xl font-extrabold tracking-tight mt-6 mb-3 text-center">
                  Set up your Groovely profile
                </h1>
                <p className="text-zinc-400 text-sm font-medium text-center px-4 mb-6">
                  You're almost ready to create, stream, and connect. Let's personalize your space
                </p>
                <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold text-white">
                  Wallet Connected: 0xA3C...91B7
                </div>
              </div>

              {/* Profile Image Upload */}
              <div className="flex justify-center mb-8">
                <div className="relative group cursor-pointer">
                  <div className="w-[120px] h-[120px] rounded-full border-[3px] border-white flex items-center justify-center bg-transparent transition-transform duration-300 group-hover:scale-105">
                    <UserIcon />
                  </div>
                  <div className="absolute bottom-0 right-0 w-9 h-9 border-[3px] border-[#0F0F16] rounded-full bg-accent-purple flex items-center justify-center group-hover:bg-opacity-90 transition-colors">
                    <PencilIcon />
                  </div>
                </div>
              </div>

              {/* Profile Form Content */}
              <div className="space-y-5">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Display Name</label>
                  <input
                    type="text"
                    placeholder="Enter your display name"
                    className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 placeholder-zinc-600 text-white focus:outline-none focus:border-accent-purple transition-colors"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium pt-0.5">@</span>
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full bg-transparent border border-white/20 rounded-xl pl-10 pr-4 py-3 placeholder-zinc-600 text-white focus:outline-none focus:border-accent-purple transition-colors"
                    />
                  </div>
                </div>

                {role === 'creator' && (
                  <>
                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Bio</label>
                      <textarea
                        placeholder="Tell the world what kind of sound you make"
                        rows={4}
                        className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 placeholder-zinc-600 text-white focus:outline-none focus:border-accent-purple transition-colors resize-none"
                      />
                    </div>

                    {/* Creator Type */}
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Creator Type</label>
                      <div className="relative">
                        <select className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-zinc-500 appearance-none focus:outline-none focus:border-accent-purple transition-colors cursor-pointer">
                          <option value="" disabled selected>I'm a...</option>
                          <option value="artist">Artist</option>
                          <option value="producer">Producer</option>
                          <option value="dj">DJ</option>
                        </select>
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {role === 'creator' && (
                <>
                  {/* Social Connections */}
                  <div className="flex items-center gap-4 text-zinc-500 text-[11px] font-medium my-8">
                    <div className="h-px bg-white/10 flex-1" />
                    <span>Connect Your Socials</span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>

                  <div className="flex gap-4 mb-8">
                    <button className="flex-1 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/5 hover:border-accent-purple transition-all duration-300">
                      <XIcon />
                    </button>
                    <button className="flex-1 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/5 hover:border-accent-purple transition-all duration-300">
                      <InstagramIcon />
                    </button>
                    <button className="flex-1 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/5 hover:border-accent-purple transition-all duration-300">
                      <SoundCloudIcon />
                    </button>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className={`flex gap-4 w-full ${role === 'listener' ? 'mt-8' : ''}`}>
                {role === 'creator' && (
                  <div className="flex-1">
                    <Button variant="secondary" className="w-full text-sm">Save as Draft</Button>
                  </div>
                )}
                <div className="flex-1">
                  <Button variant="primary" className="w-full text-sm" onClick={() => setStep(4)}>Save & Continue</Button>
                </div>
              </div>

              <p className="text-zinc-500 text-[11px] font-medium text-center mt-6">
                You're almost ready to create, stream, and connect. Let's personalize your
                space
              </p>
            </>
          )}

          {step === 4 && (
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center text-center md:text-left">
              <div className="w-full md:w-1/2 flex-shrink-0">
                <img 
                   src={role === 'creator' 
                     ? "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                     : "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                   } 
                   alt={role === 'creator' ? "Creator Success" : "Fan Success"} 
                   className="w-full aspect-[4/5] object-cover rounded-[32px] shadow-lg"
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center py-4">
                 <h1 className="text-[32px] md:text-4xl font-extrabold tracking-tight mb-4 text-white">
                   {role === 'creator' ? `You're all set, [Display Name]!` : `Welcome to Groovely, [Display Name]!`}
                 </h1>
                 <p className="text-zinc-400 text-base font-medium mb-10 leading-relaxed max-w-sm mx-auto md:mx-0">
                   Your wallet and profile are now connected to Groovely<br/><br/>
                   {role === 'creator' 
                     ? "Start creating, streaming, and connecting with your sound"
                     : "Start streaming and connecting with your sound"
                   }
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 mb-8">
                   <Button variant="secondary" className="flex-1 bg-white/5 border-none hover:bg-white/10 text-sm" onClick={() => router.push('/marketplace')}>Visit Marketplace</Button>
                   <Button variant="primary" className="flex-1 text-sm" onClick={() => router.push(role === 'creator' ? '/dashboard' : '/explore')}>
                     {role === 'creator' ? 'Go to Dashboard' : 'Explore'}
                   </Button>
                 </div>
                 <p className="text-zinc-500 text-[11px] font-medium px-4 md:px-0">
                   Groovely keeps your data secure, your wallet stays under your control
                 </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
