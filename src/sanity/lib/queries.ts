import { defineQuery } from 'next-sanity'

const imageFragment = /* groq */ `
  asset->{
    _id,
    url,
    metadata { lqip, dimensions }
  },
  alt
`

const seoFragment = /* groq */ `
  seo{
    title,
    description,
    image{ ${imageFragment} },
  }
`

export const SITE_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    title,
    tagline,
    description,
    logo{ ${imageFragment} },
    socialLinks[]{ platform, url },
    ${seoFragment},
  }
`)

export const PROJECTS_QUERY = defineQuery(/* groq */ `
  *[_type == "project" && defined(slug.current)]
  | order(year desc) {
    _id,
    title,
    "slug": slug.current,
    client,
    year,
    description,
    categories,
    "coverImage": gallery[0].image{ ${imageFragment} },
  }
`)

export const PROJECT_QUERY = defineQuery(/* groq */ `
  *[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    client,
    year,
    description,
    categories,
    gallery[]{
      mediaType,
      image{ ${imageFragment} },
      "videoUrl": video.asset->url,
    },
    ${seoFragment},
  }
`)

export const PROJECT_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "project" && defined(slug.current)]{
    "slug": slug.current
  }
`)

export const HOMEPAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "homepage" && _id == "homepage"][0]{
    items[]{
      mediaType,
      image{ ${imageFragment} },
      "videoUrl": video.asset->url,
      project->{
        title,
        "slug": slug.current
      }
    }
  }
`)

export const ABOUT_QUERY = defineQuery(/* groq */ `
  *[_type == "about" && _id == "about"][0]{
    mainDescription,
    exhibitions[]{ year, title },
    press[]{ name, url },
    interviews[]{ name, url },
    contact,
    social[]{ platform, url },
  }
`)
