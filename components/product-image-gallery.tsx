"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export function ProductImageGallery({ images, title }: { images: readonly string[]; title: string }) {
	const [selected, setSelected] = useState(images[0]);
	const [lightboxOpen, setLightboxOpen] = useState(false);

	useEffect(() => {
		if (!lightboxOpen) return;
		const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setLightboxOpen(false); };
		document.addEventListener("keydown", closeOnEscape);
		return () => document.removeEventListener("keydown", closeOnEscape);
	}, [lightboxOpen]);

	if (!images.length) {
		return <div className="gallery"><div className="gallery-main"><div className="product-image" role="img" aria-label={`${title} image unavailable`} /></div></div>;
	}

	return (
		<div className="gallery">
			<div className="gallery-main">
				<button className="gallery-zoom" type="button" aria-label={`Enlarge ${title} image`} onClick={() => setLightboxOpen(true)}>
					<Image src={selected} alt={`${title} product image`} width={760} height={950} priority />
					<span aria-hidden="true"> 확대</span>
				</button>
			</div>
			<div className="gallery-thumbs" aria-label="Product images">
				{images.map((image, index) => (
					<button
						key={image}
						type="button"
						className={selected === image ? "thumb active" : "thumb"}
						aria-label={`View ${title} image ${index + 1}`}
						aria-current={selected === image ? "true" : undefined}
						onClick={() => setSelected(image)}
					>
						<Image src={image} alt="" width={96} height={120} />
					</button>
				))}
			</div>
			{lightboxOpen ? (
				<div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} enlarged image`} onClick={() => setLightboxOpen(false)}>
					<button className="lightbox-close" type="button" aria-label="Close enlarged image" onClick={() => setLightboxOpen(false)}>×</button>
					<Image src={selected} alt={`${title} enlarged product image`} width={1200} height={1500} onClick={(event) => event.stopPropagation()} />
				</div>
			) : null}
		</div>
	);
}