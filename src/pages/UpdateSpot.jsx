// components
import PageHeader from "@layout/PageHeader";
import Spring from "@components/Spring";
import { toast } from "react-toastify";
import classNames from "classnames";

// hooks
import { useForm } from "react-hook-form";
import {
  getSpotFirebaseFn,
  updateSpotFirebaseFn,
} from "../firebase/realtimeFn";
import { useParams } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { setSpots } from "../store/reducer";
import { useDispatch, useSelector } from "react-redux";
const UpdateSpot = () => {
  const { spots } = useSelector((state) => state?.auth);
  const dispatch = useDispatch();
  const { id } = useParams();
  const defaultValues = {
    spotName: "",
    address: "",
    link: "",
    lng: "",
    lat: "",
  };
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });
  const fetchSpotsFun = useCallback(async () => {
    try {
      const result = await getSpotFirebaseFn();
      dispatch(setSpots({ spots: result }));
    } catch (error) {
      toast.error(error?.message || error);
    }
  }, [dispatch]);
  useEffect(() => {
    if (spots?.length > 0 && id) {
      const result = spots?.find((spot) => spot?.id === id);
      if (result) {
        Object.entries(result).forEach(([key, value]) => {
          const keyValue = {
            name: "spotName",
            lat: "lat",
            lng: "lng",
            adress: "address",
            link: "link",
          };
          setValue(keyValue[key], value);
        });
      } else {
        toast.error("Item not found.");
      }
    }
  }, [spots, id, setValue]);

  useEffect(() => {
    fetchSpotsFun();
  }, [fetchSpotsFun]);
  const handlePublish = async (data) => {
    await updateSpotFirebaseFn(id, {
      name: data?.spotName,
      lat: Number(data?.lat),
      lng: Number(data?.lng),
      adress: data?.address,
      link: data?.link,
    })
      .then(async () => {
        await fetchSpotsFun();
        toast.success("Updated successfully");
      })
      .catch((err) => {
        toast.err(err);
      });
  };
  return (
    <>
      <PageHeader title="Update Spot" />
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
                  {...register("link", {
                    required: true,
                    pattern: {
                      value: /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,6}\/?(\S*)?$/i,
                      message: "Please enter a valid spot link",
                    },
                  })}
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
    </>
  );
};

export default UpdateSpot;
