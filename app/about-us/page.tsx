'use client'

import React, { useEffect, useState, useRef } from 'react';
import { Target, Package, Smartphone, Eye, Zap, Users, MessageCircle, TrendingUp, Cpu, Building2, Globe } from 'lucide-react';

import Navbar from '@/components/layout/navbar'; // Navbar layout global
import Footer from '@/components/layout/footer'; // Footer layout global

interface AnimatedCounterProps {
  end: any;
  duration?: number;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsVisible(true);
          hasAnimated.current = true;
        }
      },
      { threshold: 0.3 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

		let startTime: number;
		let animationFrame: number | null = null;

    const animate = (timestamp:any) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function untuk efek smooth
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const current = Math.floor(end * easeOutQuart);
      
      setCount(current);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, end, duration]);

  return (
    <span ref={counterRef} className="inline-block">
      {count}{suffix}
    </span>
  );
};

const AboutPage = () => {
  const stats = [
    { number: "28", label: "Tahun Berpengalaman",suffix:"+" },
    { number: "42", label: "Pusat Distribusi" },
    { number: "2099", label: "Gerai Retail" },
    { number: "54000", label: "Outlet Mitra",suffix:"+" }
  ];
	const [scrolled, setScrolled] = useState<boolean>(false); // Menandai apakah halaman sudah discroll (ubah style navbar)
	const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false); // Menandai apakah menu mobile sedang terbuka

  const cards = [
    {
      icon: <Package size={32} />,
      title: "Distribusi Terintegrasi",
      description: "Jaringan distribusi yang luas meliputi 42 pusat distribusi dan lebih dari 54,000 outlet mitra di seluruh Indonesia, Malaysia, dan Singapura"
    },
    {
      icon: <Building2 size={32} />,
      title: "Retail Modern",
      description: "Mengoperasikan 2,099 gerai retail modern di berbagai format termasuk Erafone, iBox, dan berbagai brand exclusive stores"
    },
    {
      icon: <Smartphone size={32} />,
      title: "Produk & Layanan",
      description: "Menyediakan smartphone, tablet, IoT devices, aksesori, dan value-added services seperti TecProtec dan handset leasing"
    }
  ];

  const values = [
    { icon: <Zap size={40} />, title: "Innovation", desc: "Strategic thinking untuk terus berinovasi menghadirkan solusi terbaik" },
    { icon: <Users size={40} />, title: "Leadership", desc: "Strategic leadership dalam memimpin dan mengembangkan talenta" },
    { icon: <MessageCircle size={40} />, title: "Customer Service", desc: "Reliable partner dengan orientasi kualitas dan pencapaian" },
    { icon: <TrendingUp size={40} />, title: "Agility", desc: "Creative agility untuk beradaptasi dengan perubahan pasar" },
    { icon: <Cpu size={40} />, title: "Digital", desc: "Technology savvy dalam memanfaatkan teknologi digital" }
  ];

  const milestones = [
    { year: "1996", title: "Pendirian Erajaya", desc: "PT Erajaya Swasembada didirikan pada 8 Oktober 1996, memulai perjalanan sebagai distributor perangkat telekomunikasi" },
    { year: "2000-an", title: "Ekspansi Retail", desc: "Pembukaan gerai retail pertama dan pengembangan jaringan distribusi di seluruh Indonesia" },
    { year: "2011", title: "Go Public", desc: "IPO di Bursa Efek Indonesia, memperkuat posisi sebagai perusahaan publik yang terpercaya" },
    { year: "2015", title: "Digital Transformation", desc: "Peluncuran platform e-commerce dan integrasi teknologi digital dalam operasional" },
    { year: "2020-an", title: "Ekspansi Regional", desc: "Perluasan operasional ke Malaysia dan Singapura, memperkuat posisi di Asia Tenggara" },
    { year: "2024", title: "Inovasi Berkelanjutan", desc: "Terus berinovasi dengan layanan value-added dan pengembangan ekosistem digital" }
  ];

  const brands = [
    { name: "Erafone", desc: "Gerai retail multi-brand terlengkap untuk smartphone dan gadget" },
    { name: "iBox", desc: "Apple Premium Reseller dengan pengalaman Apple terlengkap" },
    { name: "Urban Republic", desc: "Lifestyle store untuk produk audio dan aksesori premium" },
    { name: "Eraspace", desc: "Platform e-commerce untuk belanja gadget online" }
  ];

  return (

    <div className='bg-[#0f0f12] text-white font-sans'>
			<Navbar
				scrolled={scrolled}
				mobileMenuOpen={mobileMenuOpen}
				setMobileMenuOpen={setMobileMenuOpen}
			/>
      {/* Hero Section */}
      <section className="relative overflow-hidden mt-16 bg-[url('/banner-2.png')] bg-cover bg-top bg-no-repeat border-b border-[#2a2a2f]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00bcd4] opacity-10 blur-[150px] rounded-full"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-32">
          <div className="text-center space-y-8">
            <h1 className="text-6xl h-20 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00bcd4] to-[#00e5ff]">
              Tentang Erajaya
            </h1>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Distributor dan retailer terkemuka perangkat telekomunikasi seluler di Indonesia sejak 1996, berkomitmen menghadirkan produk berkualitas dan layanan terpercaya untuk meningkatkan kualitas hidup masyarakat
            </p>
            
            <div className="flex flex-wrap justify-center gap-16 pt-12">
							{stats.map((stat, i) => (
								<div 
									key={i} 
									className="text-center transform transition-all duration-500 hover:scale-110"
									style={{
										animation: `fadeInUp 0.8s ease-out ${i * 0.2}s both`
									}}
								>
									<div className="text-5xl font-extrabold text-[#00bcd4] mb-2 relative">
										<AnimatedCounter 
											end={stat.number} 
											duration={2500}
											suffix={stat.suffix}
										/>
										<div 
											className="absolute inset-0 blur-xl opacity-30 bg-[#00bcd4]"
											style={{
												animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
											}}
										/>
									</div>
									<div className="text-sm text-gray-500 uppercase tracking-widest">
										{stat.label}
									</div>
								</div>
							))}
						</div>
          </div>
        </div>
      </section>

      {/* Company Profile */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-extrabold text-white mb-4">Profil Perusahaan</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              PT Erajaya Swasembada Tbk, didirikan pada 8 Oktober 1996, telah berkembang menjadi perusahaan terbesar dan terpercaya di bidang distribusi dan retail perangkat telekomunikasi seluler di Indonesia
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card, i) => (
              <div key={i} className="group relative bg-[#1a1a1f] border border-[#2a2a2f] rounded-xl p-8 transition-all duration-500 hover:-translate-y-2 hover:border-[#00bcd4] hover:shadow-[0_20px_60px_rgba(0,188,212,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00bcd4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-[#00bcd4]/10 rounded-xl flex items-center justify-center mb-6 text-[#00bcd4] transition-all duration-500 group-hover:bg-[#00bcd4]/20 group-hover:shadow-[0_0_30px_rgba(0,188,212,0.6)]">
                    {card.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{card.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 px-6 bg-[#00bcd4]/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-extrabold text-white">Visi & Misi</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="group relative bg-[#1a1a1f] border border-[#2a2a2f] rounded-xl p-12 transition-all duration-500 hover:border-[#00bcd4] hover:shadow-[0_25px_70px_rgba(0,188,212,0.3)] overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00bcd4] opacity-5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#00bcd4]/15 rounded-xl flex items-center justify-center">
                    <Eye className="w-7 h-7 text-[#00bcd4]" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-white uppercase tracking-wide">Visi</h3>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Menjadi pilihan utama untuk solusi distribusi retail dalam domain gaya hidup modern yang cerdas, menciptakan nilai berkelanjutan untuk seluruh stakeholder
                </p>
              </div>
            </div>

            <div className="group relative bg-[#1a1a1f] border border-[#2a2a2f] rounded-xl p-12 transition-all duration-500 hover:border-[#00bcd4] hover:shadow-[0_25px_70px_rgba(0,188,212,0.3)] overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00bcd4] opacity-5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#00bcd4]/15 rounded-xl flex items-center justify-center">
                    <Target className="w-7 h-7 text-[#00bcd4]" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-white uppercase tracking-wide">Misi</h3>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Memenuhi kebutuhan pelanggan dengan memberikan pengalaman seamless dan reliable, menawarkan beragam produk dan layanan berkualitas tinggi, memanfaatkan jaringan retail dan distribusi yang luas sambil membangun pertumbuhan jangka panjang dan nilai bermakna bagi pelanggan, karyawan, mitra, supplier, dan pemegang saham
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-extrabold text-white mb-4">Nilai-Nilai Perusahaan</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Lima pilar nilai yang menjadi fondasi budaya dan operasional Erajaya
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {values.map((val, i) => (
              <div key={i} className="bg-[#1a1a1f] border border-[#2a2a2f] rounded-xl p-8 text-center transition-all duration-500 hover:-translate-y-1 hover:border-[#00bcd4] hover:shadow-[0_15px_50px_rgba(0,188,212,0.25)]">
                <div className="w-20 h-20 mx-auto mb-6 bg-[#00bcd4]/10 rounded-full flex items-center justify-center text-[#00bcd4]">
                  {val.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">{val.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-24 px-6 bg-[#00bcd4]/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-extrabold text-white">Perjalanan Kami</h2>
          </div>

          <div className="relative pl-12 border-l-2 border-[#2a2a2f] space-y-16">
            {milestones.map((m, i) => (
              <div key={i} className="relative pl-10">
                <div className="absolute left-[-52px] top-2 w-4 h-4 bg-[#00bcd4] rounded-full shadow-[0_0_20px_rgba(0,188,212,0.8)]"></div>
                
                <div className="text-3xl font-extrabold text-[#00bcd4] mb-2">{m.year}</div>
                <h4 className="text-2xl font-bold text-white mb-3">{m.title}</h4>
                <p className="text-gray-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-extrabold text-white mb-4">Ekosistem Brand Kami</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Portofolio brand retail yang melayani berbagai segmen dan kebutuhan pelanggan
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brands.map((b, i) => (
              <div key={i} className="bg-[#1a1a1f] border border-[#2a2a2f] rounded-xl p-8 text-center transition-all duration-500 hover:-translate-y-1 hover:border-[#00bcd4] hover:shadow-[0_15px_50px_rgba(0,188,212,0.25)]">
                <div className="w-full h-32 bg-[#00bcd4]/5 rounded-xl flex items-center justify-center mb-6 text-3xl font-extrabold text-[#00bcd4] transition-all duration-500 hover:bg-[#00bcd4]/10">
                  {b.name}
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{b.name}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;