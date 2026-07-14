import { type SchemaTypeDefinition } from 'sanity'

import { siteSettings } from './documents/siteSettings'
import { homepage } from './documents/homepage'
import { about } from './documents/about'
import { project } from './documents/project'
import { seo } from './objects/seo'
import { homepageItem } from './objects/homepageItem'
import { galleryItem } from './objects/galleryItem'
import { socialLink } from './objects/socialLink'
import { linkItem } from './objects/linkItem'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    siteSettings,
    homepage,
    about,
    project,
    seo,
    homepageItem,
    galleryItem,
    socialLink,
    linkItem,
  ],
}
