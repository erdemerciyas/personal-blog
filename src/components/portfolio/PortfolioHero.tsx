import PageHero from '../common/PageHero';

interface PortfolioHeroProps {
  title?: string;
  description?: string;
  buttonLink?: string;
}

export default function PortfolioHero({ 
  title = "Portfolyo", 
  description = "Tamamladığımız başarılı projeler ve yaratıcı çözümler",
  buttonLink = "#projects"
}: PortfolioHeroProps) {
  return (
    <PageHero
      title={title}
      description={description}
      buttonText={""}
      buttonLink={buttonLink}
      badge=""
      backgroundGradient="bg-gradient-primary"
      showButton={true}
    />
  );
}