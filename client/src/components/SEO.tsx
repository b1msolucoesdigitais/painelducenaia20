import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = "Painel Ducena IA - Sistema de Gerenciamento de Prompts para IA",
  description = "Painel moderno para configuração e gerenciamento de prompts de IA. Interface intuitiva para criar, editar e organizar seções de prompts com integração webhook.",
  keywords = "IA, inteligência artificial, prompts, gerenciamento, painel, configuração, webhook, automação",
  image = "/og-image.png",
  url = "https://iaducena.b1mdigital.com.br",
  type = "website",
  author = "BM Digital"
}) => {
  const fullTitle = title.includes("Painel Ducena IA") ? title : `${title} | Painel Ducena IA`;
  const fullImage = image.startsWith('http') ? image : `${url}${image}`;
  const fullUrl = url;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Painel Ducena IA" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />

      {/* Additional SEO */}
      <meta name="application-name" content="Painel Ducena IA" />
      <meta name="apple-mobile-web-app-title" content="Painel Ducena IA" />
    </Helmet>
  );
};

export default SEO;
