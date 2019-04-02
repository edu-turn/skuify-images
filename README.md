# Skuify Images

Skuify images takes images from a `src/` directory and subdirectories that match a SKU regex, compress them, and move them to a `dist` directory.

## Running
You will [node.js]() installed on your machine. It is suggested to the LTS version of node.

- Launch a terminal application on your computer and navigate to the directory you have copied skuify images.
- Create a `src` directory and fill it with images you need to transform
- Run `node index.js` in your terminal

## Environment Variables
Different environment variables change how the program behaves.

| Name               | Description                                                                                               | Data Type | Default Value                                           |
|--------------------|-----------------------------------------------------------------------------------------------------------|-----------|---------------------------------------------------------|
| DIR_MODE           | Whether or not to search for subdirectories using the regex, or just look for images in the src directory | Boolean   | TRUE                                                    |
| CHANGE_IMG_NAME    | Whether or not change the name of the image to match the SKU                                              | Boolean   | TRUE                                                    |
| RESIZE_IMAGE       | Resize the image to the RESIZE_IMAGE_WIDTH variable                                                       | Boolean   | TRUE                                                    |
| RESIZE_IMAGE_WIDTH | The width to resize the image to.                                                                         | Boolean   | TRUE                                                    |
| IMAGE_REGEX        | Regex used to identify images.                                                                            | Regex     | `/\.(gif|jpg|jpeg|tiff|png)$/i`                         |
| SKU_REGEX          | Regex used to identify SKUs                                                                               | Regex     | `/([A-Z]{2}\d{2}[A-Z]{2})|([A-Z]{2}\d{2,4}-\w{2,4})/ig` |
