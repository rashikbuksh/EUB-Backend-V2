import article_authors from './article_authors';
import article_images from './article_images';
import article_keywords from './article_keywords';
import articles from './articles';
import authors from './authors';
import boards from './boards';
import keywords from './keywords';
import scope from './scope';
import volume from './volume';

export default [boards, volume, scope, keywords, articles, article_images, article_authors, article_keywords, authors] as const;
