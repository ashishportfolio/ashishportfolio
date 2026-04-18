import { SERVICES } from '../data/projects';
import CustomCursor from '../components/CustomCursor';
import Reveal from '../components/Reveal';

export default function Services() {
  return (
    <div className="pt-16 lg:pt-40 pb-10 lg:pb-20 px-6 md:px-12 bg-bg overflow-x-hidden text-center lg:text-left">
      <CustomCursor />
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 lg:mb-20">
          <Reveal type="text" className="text-5xl md:text-[6vw] font-display font-medium leading-[1] uppercase">
            MY <br /> <span className="font-serif italic font-normal">SERVICES</span>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          {SERVICES.map((service, i) => (
            <div key={service.title}>
              <Reveal
                type="fade"
                delay={i * 0.2}
                className="space-y-8"
              >
                <h2 className="text-[10px] font-sans tracking-[0.4em] text-muted uppercase">0{i + 1} / {service.title}</h2>
                <ul className="space-y-4">
                  {service.items.map((item) => (
                    <li key={item} className="text-xl md:text-2xl font-display font-medium tracking-tight hover:italic transition-all duration-300 cursor-default">
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          ))}
        </div>

        {/* Process */}
        <section className="mt-8 lg:mt-20 pt-8 lg:pt-20 border-t border-border">
          <Reveal type="fade">
            <h2 className="text-[10px] font-sans tracking-[0.4em] text-muted uppercase mb-10 lg:mb-20">The Process</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { title: 'Discovery', desc: 'Deep-diving into brand perception, audience behavior, and core business objectives.' },
              { title: 'Strategy', desc: 'Defining the visual language, creative direction, and AI production integration points.' },
              { title: 'Production', desc: 'High-end execution across brand identity, cinematic visuals, and AI-led storytelling.' },
              { title: 'Evolution', desc: 'Final implementation and establishing a brand world that scales and adapts.' }
            ].map((step, i) => (
              <div key={step.title}>
                <Reveal type="fade" delay={i * 0.2} className="space-y-4">
                  <span className="text-[10px] font-sans tracking-[0.3em] text-muted uppercase">Step 0{i + 1}</span>
                  <h3 className="text-2xl font-display font-medium tracking-tight">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted uppercase tracking-widest">{step.desc}</p>
                </Reveal>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
