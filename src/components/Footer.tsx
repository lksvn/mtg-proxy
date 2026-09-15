import { useI18n } from '../i18n/context';
import { NavigationBar } from "./navigationBar";

export function Footer() {
	const { t } = useI18n();
	return (
		<footer>
            <NavigationBar label={t('footerNavigation')} />
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
