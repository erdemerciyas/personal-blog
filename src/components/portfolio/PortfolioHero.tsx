import PageHero from '../common/PageHero';

interface PortfolioHeroProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function PortfolioHero({ 
  title = "Portfolyo", 
  description = "Tamamladığımız başarılı projeler ve yaratıcı çözümler",
  buttonText = "Projeleri İncele",
  buttonLink = "#projects"
}: PortfolioHeroProps) {
  return (
    <PageHero
      title={title}
      description={description}
      buttonText={buttonText}
      buttonLink={buttonLink}
      badge="Yaratıcı Çözümler"
      backgroundGradient="from-slate-900 via-teal-900 to-blue-900"
      showButton={true}
    />
  );
}