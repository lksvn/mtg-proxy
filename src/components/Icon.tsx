import type { IconName } from "../generated/IconName";

type IconProps = {
    className?: string,
    name: IconName
}

export function Icon({ className, name}: IconProps) {
    return (
        <svg className={`icon${className ? ' ' + className : ''}`} aria-hidden="true"><use href={`${import.meta.env.BASE_URL}/icons.svg#${name}`} /></svg>
    );
}