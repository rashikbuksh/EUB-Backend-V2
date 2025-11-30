import article_images from './article_images';
import articles from './articles';
import authors from './authors';
import boards from './boards';
import keywords from './keywords';
import scope from './scope';
import volume from './volume';

export default [boards, volume, scope, keywords, articles, article_images, authors] as const;
