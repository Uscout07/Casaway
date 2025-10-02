interface StructuredDataProps {
  type?: 'Organization' | 'WebSite' | 'WebApplication' | 'LocalBusiness' | 'Product' | 'Service';
  data?: any;
}

export default function StructuredData({ type = 'WebSite', data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
      name: 'Casaway',
      description: 'Swap homes and find trusted home exchanges worldwide. Discover stays, list your place, and coordinate smooth swaps with Casaway.',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://casaway.vercel.app',
      logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://casaway.vercel.app'}/logo.png`,
      sameAs: [
        'https://twitter.com/casawayapp',
        'https://instagram.com/casawayapp',
        'https://facebook.com/casawayapp'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'support@casaway.com'
      },
      foundingDate: '2024',
      keywords: 'home swap, home exchange, house swap, apartment swap, vacation home exchange, room swap, home sharing, travel swap',
      audience: {
        '@type': 'Audience',
        audienceType: 'Students'
      },
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      }
    };

    switch (type) {
      case 'WebSite':
        return {
          ...baseData,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://casaway.vercel.app'}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        };
      
      case 'WebApplication':
        return {
          ...baseData,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Web Browser',
          browserRequirements: 'Requires JavaScript. Requires HTML5.',
          softwareVersion: '1.0',
          releaseNotes: 'Initial release of Casaway student housing platform'
        };

      case 'Organization':
        return {
          ...baseData,
          '@type': 'Organization',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'US'
          }
        };

      default:
        return { ...baseData, ...data };
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData(), null, 2)
      }}
    />
  );
}

// Specific structured data components for different page types
export function OrganizationStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Casaway',
          description: 'Home swapping platform connecting people worldwide for accommodation sharing and home exchanges.',
          url: process.env.NEXT_PUBLIC_APP_URL || 'https://casaway.vercel.app',
          logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://casaway.vercel.app'}/logo.png`,
          foundingDate: '2024',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'support@casaway.com'
          },
          sameAs: [
            'https://twitter.com/casawayapp',
            'https://instagram.com/casawayapp',
            'https://facebook.com/casawayapp'
          ]
        }, null, 2)
      }}
    />
  );
}

export function WebSiteStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Casaway',
          description: 'Swap homes and find trusted home exchanges worldwide. Discover stays, list your place, and coordinate smooth swaps with Casaway.',
          url: process.env.NEXT_PUBLIC_APP_URL || 'https://casaway.vercel.app',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://casaway.vercel.app'}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        }, null, 2)
      }}
    />
  );
}

export function WebApplicationStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Casaway',
          description: 'Home swapping platform for finding and listing stays worldwide.',
          url: process.env.NEXT_PUBLIC_APP_URL || 'https://casaway.vercel.app',
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Web Browser',
          browserRequirements: 'Requires JavaScript. Requires HTML5.',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
          },
          audience: {
            '@type': 'Audience',
            audienceType: 'Students'
          }
        }, null, 2)
      }}
    />
  );
}
