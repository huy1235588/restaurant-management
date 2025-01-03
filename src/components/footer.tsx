import Image from "next/image";

function Footer() {
    return (
        <footer>
            <div className="footer-container">
                <h1 className="brand-name">
                    Elevating the dining experience.
                </h1>

                <h2>
                    Follow us on social media
                </h2>

                <div className="social-media-container">
                    <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                        <Image
                            src="/images/brand/facebook.png"
                            alt="Facebook"
                            width={50}
                            height={50}
                        />
                    </a>
                    <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                        <Image
                            src="/images/brand/instagram.png"
                            alt="Instagram"
                            width={50}
                            height={50}
                        />
                    </a>
                    <a href="https://twitter.com/" target="_blank" rel="noreferrer">
                        <Image
                            src="/images/brand/twitter.png"
                            alt="Twitter"
                            width={50}
                            height={50}
                        />
                    </a>
                    <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">
                        <Image
                            src="/images/brand/youtube.png"
                            alt="YouTube"
                            width={50}
                            height={50}
                        />
                    </a>
                    <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer">
                        <Image
                            src="/images/brand/pinterest.png"
                            alt="Pinterest"
                            width={50}
                            height={50}
                        />
                    </a>
                </div>

                <p className="copy-right">
                    &copy; 2021 Restaurant Management
                </p>
            </div>
        </footer>
    );
}

export default Footer;