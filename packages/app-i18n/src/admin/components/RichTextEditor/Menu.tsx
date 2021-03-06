import React from "react";
import styled from "@emotion/styled";
import { css } from "emotion";
import { useSlate } from "slate-react";
import classNames from "classnames";
import { FormComponentProps } from "@webiny/ui/types";

const MenuContainer = styled("div")({
    position: "relative",
    padding: "10px 0 20px 1px",
    borderBottom: "2px solid var(--mdc-theme-on-background)",
    display: "flex",
    alignItems: "center",
    "& > *": {
        display: "inline-block"
    },
    "& > * + *": {
        marginLeft: 10
    },
    span: {
        display: "flex",
        alignContent: "center",
        ">svg": {
            height: 18
        }
    }
});

export type MenuButtonProps = {
    className?: string;
    onClick?: (e: React.SyntheticEvent) => void;
    active?: boolean;
    children: React.ReactNode;
    onMouseDown?: (e: React.SyntheticEvent) => void;
};

export const MenuButton: React.FC<MenuButtonProps> = ({
    className,
    onClick,
    active,
    children,
    onMouseDown = e => e.preventDefault()
}) => {
    const buttonStyle = css({
        cursor: "pointer",
        color: active
            ? "var(--mdc-theme-primary)"
            : "var(--mdc-theme-text-secondary-on-background)",
        "&:hover": {
            color: "var(--mdc-theme-primary)"
        }
    });

    return (
        <span
            onClick={onClick}
            className={classNames(className, buttonStyle)}
            onMouseDown={onMouseDown}
        >
            {children}
        </span>
    );
};

export type MenuProps = FormComponentProps & {
    activePlugin?: { [key: string]: any };
    activatePlugin: Function;
    deactivatePlugin: Function;
    plugins: { [key: string]: any }[];
};

export const Menu = (props: MenuProps) => {
    const editor = useSlate();
    const { activePlugin, activatePlugin, deactivatePlugin, plugins } = props;

    return (
        <MenuContainer>
            {plugins
                .filter(pl => pl.menu)
                .map(item =>
                    React.cloneElement(
                        item.menu.render({
                            MenuButton,
                            editor,
                            activatePlugin
                        }),
                        {
                            key: item.name
                        }
                    )
                )}

            {plugins
                .filter(pl => pl.menu && typeof pl.menu.renderDialog === "function")
                .map(pl => {
                    const props = {
                        editor,
                        open: activePlugin ? activePlugin.plugin === pl.name : false,
                        closeDialog: deactivatePlugin,
                        activePlugin,
                        activatePlugin
                    };
                    return React.cloneElement(pl.menu.renderDialog(props), { key: pl.name });
                })}
        </MenuContainer>
    );
};
