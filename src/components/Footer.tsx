import { Icon } from "./Icon";
import { useI18n } from '../i18n/context';

export function Footer() {
	const { t } = useI18n();
	return (
		<footer>
			<nav aria-label={t('footerNavigation')}>
				<ul>
					<li><a href="https://lksvn.com.br"><Icon name="arrow-right" className="flip-h"/> {t('home')}</a></li>
					<li><a href="https://github.com/lksvn/mtg-proxy/" target="_blank" rel="noopener noreferrer">{t('deckLists')} (v0.7.1)</a></li>
					<li><a href="https://github.com/lksvn/mtg-proxy/#editor" target="_blank" rel="noopener noreferrer">{t('customCard')} (v0.1)</a></li>
					<li><a href="https://github.com/lksvn/mtg-proxy" target="_blank" rel="noopener noreferrer"><Icon name="github" /> {t('githubRepository')}</a></li>
				</ul>
			</nav>
			<p>
				{t('cardDataProvidedBy')}{' '}
				<a href="https://scryfall.com/">Scryfall</a>.
			</p>
			<p>
				{t('hostedBy')} <a href="https://pages.github.com/" rel="noopener noreferrer" target="_blank">GitHub Pages</a> {t('servedThrough')} <a href="https://www.cloudflare.com/" rel="noopener noreferrer" target="_blank">Cloudflare</a>.
			</p>
			<p>
				{t('disclaimer')}
			</p>
		</footer>
	);
}
