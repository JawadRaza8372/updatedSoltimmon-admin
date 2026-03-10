// components

// utils
import classNames from "classnames";

const ProductEditor = () => {
  // do something with the data

  return (
    <Spring className="card flex-1 xl:py-10">
      <form className="grid grid-cols-1">
        <div className="grid grid-cols-1 gap-y-4 gap-x-2">
          <div className="field-wrapper">
            <label className="field-label" htmlFor="productName">
              Spot Name
            </label>
            <input
              className={classNames("field-input", {
                "field-input--error": errors.spotName,
              })}
              id="spotName"
              type="text"
              defaultValue={defaultValues.spotName}
              placeholder="Enter Spot Name"
              {...register("spotName", { required: true })}
            />
          </div>
          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
            <div className="field-wrapper">
              <label className="field-label" htmlFor="brandName">
                Spot Address
              </label>
              <input
                className={classNames("field-input", {
                  "field-input--error": errors.address,
                })}
                id="address"
                type="text"
                defaultValue={defaultValues.address}
                placeholder="Enter Spot Address"
                {...register("address", { required: true })}
              />
            </div>
            <div className="field-wrapper">
              <label className="field-label" htmlFor="category">
                Spot Location Link
              </label>
              <input
                className={classNames("field-input", {
                  "field-input--error": errors.link,
                })}
                id="link"
                type="url"
                defaultValue={defaultValues.link}
                placeholder="Enter Spot Link"
                {...register("link", { required: true })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
            <div className="field-wrapper">
              <label className="field-label" htmlFor="regularPrice">
                Latitude
              </label>
              <input
                className={classNames("field-input", {
                  "field-input--error": errors.lat,
                })}
                id="lat"
                type="number"
                defaultValue={defaultValues.lat}
                placeholder="99.99"
                {...register("lat", {
                  required: true,
                })}
              />
            </div>
            <div className="field-wrapper">
              <label className="field-label" htmlFor="salePrice">
                longitude
              </label>
              <input
                className={classNames("field-input", {
                  "field-input--error": errors.lng,
                })}
                id="lng"
                type="number"
                defaultValue={defaultValues.lng}
                placeholder="99.99"
                {...register("lng", {
                  required: true,
                })}
              />
            </div>
          </div>

          <button
            disabled={
              errors.address ||
              errors.lat ||
              errors.lng ||
              errors.link ||
              errors.spotName
            }
            className="btn mt-5 btn--primary max-w-[150px]"
            onClick={handleSubmit(handlePublish)}
          >
            Publish
          </button>
        </div>
      </form>
    </Spring>
  );
};

export default ProductEditor;
