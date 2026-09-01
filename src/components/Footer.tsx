import { Icon } from "./Icon";

export function Footer() {
    return (
        <footer>
            <nav aria-label="Footer navigation">
                <ul>
                    <li><a href="https://lksvn.com.br"><Icon name="arrow-right" className="flip-h"/> Home</a></li>
                    <li><a href="https://github.com/lksvn/mtg-proxy" target="_blank" rel="noopener noreferrer"><Icon name="github" /> GitHub Repository</a></li>
                </ul>
            </nav>
			<p>
				Card data and images provided by{' '}
				<a href="https://scryfall.com/">Scryfall</a>.
			</p>
            <p>
                Hosted by <a href="https://pages.github.com/" rel="noopener noreferrer" target="_blank">GitHub Pages</a> and served through <a href="https://www.cloudflare.com/" rel="noopener noreferrer" target="_blank">Cloudflare</a>.
            </p>
			<p>
				For personal playtesting only. Not affiliated with or endorsed
				by Wizards of the Coast.
			</p>
		</footer>
    );
}