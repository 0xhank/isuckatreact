

const buttonContentDescription = {
    id: "a unique id for the button",
    className:
        "a class name for the button. Used to style the button. The options are: default, destructive, outline, secondary, ghost, link",
    variant:
        "OPTIONAL the variant of the button. The options are: default, destructive, outline, secondary, ghost, link",
    size: "OPTIONAL the size of the button. The options are: default, sm, lg, icon ",
    content: "the content of the button. Must be a string",
    action: "OPTIONAL the action of the button. Must be a javascript function that will be called when the button is clicked",
};

export const components = {
    button: {
        description: "A button component",
        contentDescription: buttonContentDescription,
    },
};