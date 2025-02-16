import { Source } from "@/app/page";
import { Button, Menu, MenuItem } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

interface FooterProps {
    sourceOptions: Array<Source>;
    selectedSource: Source;
    setSelectedSource: React.Dispatch<React.SetStateAction<Source>>;
}

const Footer: React.FC<FooterProps> = ({ sourceOptions, selectedSource, setSelectedSource }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelectSource = (option: Source) => {
        setSelectedSource({
            label: option.label,
            type: option.type,
            src: option.src,
        });
        handleClose();
    };

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

            {/* Source selector */}
            <div className="source-selector">
                <Button className="source-button"
                    variant="contained"
                    onClick={handleClick}
                >
                    {selectedSource.label}
                </Button>
                <Menu
                    className="source-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    disableScrollLock={true}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "center",
                    }}
                    transformOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                    }}
                >
                    {sourceOptions.map((option) => (
                        <MenuItem
                            className="source-option"
                            key={option.label}
                            onClick={() => handleSelectSource(option)}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Menu>
            </div>
        </footer>
    );
}

export default Footer;