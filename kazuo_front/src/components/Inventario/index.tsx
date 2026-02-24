"use client";
import { ICategory, IStore } from "@/interfaces/types";
import { useEffect, useState, useRef, Fragment } from "react";
import { FaPencilAlt, FaTimes } from "react-icons/fa";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import { Menu, Transition, Dialog } from "@headlessui/react";
import { BiDotsHorizontal, BiSearch, BiMenu } from "react-icons/bi";
import { useTranslation } from "react-i18next";

import Loader from "../Loader/Loader";
import Link from "next/link";
import {
  Underline,
  Home,
  Lightbulb,
  ClipboardList,
  Phone,
  Users,
  LogOut,
  LayoutDashboard,
  Building2,
  User,
  Globe,
} from "lucide-react";
import CreateStoreModal from "./CreateStoreModal";
import { Input } from "../ui/input";

const Inventario: React.FC = () => {
  const { t } = useTranslation("global");
  const { showAlert } = useAlert();
  const [store, setStore] = useState<IStore[]>([]);
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { userData, setUserData, logout } = useAppContext();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const kazuo_back = process.env.NEXT_PUBLIC_API_URL;
  const [previewImage, setPreviewImage] = useState(userData?.igmUrl);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
  });
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleEditClick = () => {
    setIsEditing(true);
    setEditFormData({
      name: userData?.name || "",
      email: userData?.email || "",
    });
  };

  const handleLogout = async () => {
    const result = await showAlert({
      title: t("inventory.logoutConfirmTitle"),
      variant: "warning",
      showCancelButton: true,
      confirmText: t("inventory.logoutConfirmButton"),
      cancelText: t("inventory.cancel"),
    });

    if (result.isConfirmed) {
      logout();
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({ name: "", email: "" });
  };

  const handleChangePassword = async () => {
    if (
      !changePasswordData.oldPassword ||
      !changePasswordData.newPassword ||
      !changePasswordData.confirmPassword
    ) {
      showAlert({
        title: t("inventory.reportErrorTitle"),
        message: t("inventory.requiredFields"),
        variant: "danger",
      });
      return;
    }
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      showAlert({
        title: t("inventory.reportErrorTitle"),
        message: t("inventory.passwordsMismatch"),
        variant: "danger",
      });
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/;
    if (!passwordRegex.test(changePasswordData.newPassword)) {
      showAlert({
        title: t("inventory.reportErrorTitle"),
        message: t("inventory.passwordInvalid"),
        variant: "danger",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${kazuo_back}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.token}`,
        },
        body: JSON.stringify({
          oldPassword: changePasswordData.oldPassword,
          newPassword: changePasswordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || t("inventory.changePassError")
        );
      }

      showAlert({
        title: t("products.reportSuccessTitle"),
        message: t("inventory.changePassSuccess"),
        variant: "success",
      });
      setIsChangePasswordOpen(false);
      setChangePasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error(error);
      showAlert({
        title: t("inventory.reportErrorTitle"),
        message: error.message,
        variant: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editFormData.name || !editFormData.email) {
      showAlert({
        title: t("inventory.reportErrorTitle"),
        message: t("inventory.requiredFields"),
        variant: "danger",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${kazuo_back}/users/${userData?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.token}`,
        },
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email,
        }),
      });

      if (!response.ok) throw new Error(t("inventory.updateProfileError"));

      const updatedUser = await response.json();

      setUserData((prev) => ({
        ...prev!,
        name: updatedUser.name,
        email: updatedUser.email,
      }));

      const storedUser = JSON.parse(localStorage.getItem("userData") || "{}");
      localStorage.setItem(
        "userData",
        JSON.stringify({
          ...storedUser,
          name: updatedUser.name,
          email: updatedUser.email,
        })
      );

      setIsEditing(false);
      showAlert({
        title: t("products.reportSuccessTitle"),
        message: t("inventory.updateProfileSuccess"),
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      showAlert({
        title: t("inventory.reportErrorTitle"),
        message: t("inventory.updateProfileError"),
        variant: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${kazuo_back}/files/uploadProfileImage/${userData?.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userData?.token}`, // Si es necesario, incluye el token de autorización
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(t("inventory.uploadImageError"));
      }

      const data = await response.json();
      // Actualizar la URL de la imagen en el contexto
      setUserData((prevUserData) => ({
        ...prevUserData!,
        imgUrl: data.imgUrl, // Aquí recibes la nueva URL de la imagen del backend
      }));
      if (userData?.igmUrl) {
        delete userData.igmUrl;
      }
      if (userData) {
        userData.igmUrl = data.imgUrl;
        localStorage.setItem("userData", JSON.stringify(userData));
      }
      window.location.reload();
    } catch (error: any) {
      setError(error.message || t("inventory.uploadImageGenericError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePencilClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteStore = async (
    event: React.MouseEvent<HTMLButtonElement>,
    storeId: string
  ) => {
    const confirmed = await showAlert({
      title: t("inventory.deleteStoreTitle"),
      message: t("inventory.deleteStoreDesc"),
      variant: "danger",
      showCancelButton: true,
      confirmText: t("inventory.confirmDelete"),
      cancelText: t("inventory.cancel"),
    });

    if (confirmed.isConfirmed) {
      setLoading(true); // Inicia el loader
      try {
        const response = await fetch(`${kazuo_back}/store/${storeId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${userData?.token}`,
          },
        });
        console.log(userData?.token);

        if (response.ok) {
          setStore((prevStore) =>
            prevStore.filter((bodega) => bodega.id !== storeId)
          );
          showAlert({
            title: t("inventory.delete"),
            message: t("inventory.storeDeleted"),
            variant: "success",
          });
        } else {
          showAlert({
            title: t("inventory.reportErrorTitle"),
            message: t("inventory.deleteError"),
            variant: "danger",
          });
        }
      } catch (error) {
        showAlert({
          title: t("inventory.reportErrorTitle"),
          message: t("inventory.deleteErrorGeneric"),
          variant: "danger",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const getCategoryName = (categoryId: string) => {
    const categoriesFromStorage: ICategory[] = JSON.parse(
      localStorage.getItem("Categorias") || "[]"
    );
    const category = categoriesFromStorage.find((cat) => cat.id === categoryId);
    return category ? category.name : t("inventory.categoryNotFound");
  };

  // FUNCION POR PETICION0ES CRUD
  const fetchStores = async () => {
    if (userData) {
      if (!userData?.company) return;

      try {
        const response = await fetch(
          `${kazuo_back}/companies/AllStoresCompany/${userData?.company}`
        );
        const dataStore = await response.json();

        const storeInfo =
          dataStore[0]?.stores.map((store: any) => ({
            id: store?.id || "",
            name: store?.name || "",
            categoryName: store?.category?.name || "",
            categoryId: store?.category?.id || "",
          })) || [];

        setStore(storeInfo);
      } catch (error) {
        console.error("No se pudo cargar las bodegas ", error);
        setStore([]);
      }
    }
  };

  useEffect(() => {
    fetchStores();
  }, [userData]);

  const filteredStores = Array.isArray(store)
    ? store.filter(
        (bodega) =>
          bodega.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getCategoryName(bodega.categoryId)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    console.log(`Token: ${userData?.token}`);

    const handlefetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${kazuo_back}/category`);
        const dataCategory = await response.json();
        localStorage.setItem("Categorias", JSON.stringify(dataCategory));
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    handlefetchCategories();
  }, []);

  const handleNavigateToCreateStore = () => {
    if (userData) {
      setIsCreateStoreOpen(true);
    } else {
      router.push("/login");
    }
  };

  const handleNavigateToEditStore = (
    event: React.MouseEvent<HTMLButtonElement>,
    storeId: string
  ) => {
    if (userData) {
      router.push(`/storeform/${storeId}`);
    } else {
      router.push("/login");
    }
  };

  const handleNavigateToStorePage = (
    event: React.MouseEvent<HTMLButtonElement>,
    storeId: string
  ) => {
    if (userData) {
      router.push(`/Products/${storeId}`);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header con Menú Hamburguesa */}
      <div className="flex justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("inventory.title")}
        </h2>
        <div className="flex items-center gap-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm transition-colors font-medium flex items-center gap-2"
            onClick={handleNavigateToCreateStore}
          >
            <span>+</span> {t("inventory.createStore")}
          </button>
        </div>
      </div>

      <CreateStoreModal
        isOpen={isCreateStoreOpen}
        onClose={() => setIsCreateStoreOpen(false)}
        onStoreCreated={fetchStores}
      />

      {/* Modal de Perfil */}
    <Transition appear show={isProfileOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsProfileOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  {t("inventory.profileTitle")}
                </Dialog.Title>

                <div className="flex flex-col items-center gap-4">
                  {/* Avatar Section */}
                  <div className="relative group shrink-0">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center">
                      {userData?.igmUrl ? (
                        <img
                          src={userData.igmUrl}
                          alt="Perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl text-gray-400 font-bold">
                          {userData?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handlePencilClick}
                      className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors z-10"
                      title={t("inventory.changeProfilePic")}
                    >
                      <FaPencilAlt size={14} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* User Details */}
                  {isEditing ? (
                    <div className="w-full space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t("inventory.name")}
                        </label>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              name: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t("inventory.email")}
                        </label>
                        <input
                          type="email"
                          value={editFormData.email}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              email: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
                        >
                          {t("inventory.cancel")}
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          {isLoading
                            ? t("inventory.saving")
                            : t("inventory.save")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-gray-800">
                          {userData?.name}
                        </h2>
                        <p className="text-gray-500 font-medium">
                          {userData?.email}
                        </p>

                        <div className="flex justify-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              userData?.isAdmin
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            Plan: {userData?.isAdmin ? "Spot-On Pro" : "Free"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-2 mt-2">
                        <button
                          onClick={handleEditClick}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {t("inventory.editProfile")}
                        </button>
                        <button
                          onClick={() => setIsChangePasswordOpen(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {t("inventory.changePassword")}
                        </button>
                      </div>

                      {/* Upload Confirmation */}
                      {file && (
                        <div className="flex flex-col items-center gap-2 mt-2 bg-blue-50 p-2 rounded-lg border border-blue-100 w-full">
                          <p className="text-sm text-blue-700 truncate max-w-[200px]">
                            {file.name}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpload}
                              disabled={isLoading}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md shadow-sm transition-colors"
                            >
                              {isLoading
                                ? t("inventory.uploading")
                                : t("inventory.confirmChange")}
                            </button>
                            <button
                              onClick={() => setFile(null)}
                              className="p-1 hover:bg-blue-200 rounded text-blue-600"
                              title="Cancelar"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                      )}

                      {error && (
                        <p className="text-sm text-red-500 mt-2">{error}</p>
                      )}
                       <div className="mt-6 flex justify-end">
                          <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => setIsProfileOpen(false)}
                          >
                          {t("inventory.close")}
                          </button>
                      </div>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>

    {/* Modal Change Password */}
    <Transition appear show={isChangePasswordOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsChangePasswordOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  {t("inventory.changePassword")}
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t("inventory.currentPassword")}
                    </label>
                    <Input
                      type="password"
                      value={changePasswordData.oldPassword}
                      onChange={(e) =>
                        setChangePasswordData({
                          ...changePasswordData,
                          oldPassword: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t("inventory.newPassword")}
                    </label>
                    <Input
                      type="password"
                      value={changePasswordData.newPassword}
                      onChange={(e) =>
                        setChangePasswordData({
                          ...changePasswordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t("inventory.passwordRequirements")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t("inventory.confirmNewPassword")}
                    </label>
                    <Input
                      type="password"
                      value={changePasswordData.confirmPassword}
                      onChange={(e) =>
                        setChangePasswordData({
                          ...changePasswordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    onClick={() => setIsChangePasswordOpen(false)}
                  >
                    {t("inventory.cancel")}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    onClick={handleChangePassword}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? t("inventory.saving")
                      : t("inventory.save")}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>

      {/* Search Bar */}
      <div className="mb-8 relative max-w-lg mx-auto sm:mx-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <BiSearch className="text-gray-400 text-lg" />
        </div>
        <input
          type="text"
          placeholder={t("inventory.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
        />
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader message={t("inventory.loading")} />
        </div>
      ) : (
        <>
          {(() => {
            const displayStores = searchQuery === "" ? store : filteredStores;

            if (displayStores.length === 0) {
              return (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="text-gray-400 mb-3 text-5xl">📦</div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {t("inventory.noStoresTitle")}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery
                      ? t("inventory.noStoresDesc")
                      : t("inventory.noStoresEmpty")}
                  </p>
                </div>
              );
            }

             return (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {displayStores.map((bodega) => (
                   <div
                     key={bodega.id}
                     className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col overflow-hidden"
                   >
                     <div className="p-5 flex-1 relative">
                       <div className="flex justify-between items-start">
                         <div className="pr-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2" title={bodega.name}>{bodega.name}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getCategoryName(bodega.categoryId)}
                            </span>
                         </div>
                         <div className="absolute top-4 right-3">
                           <Menu as="div" className="relative">
                             <Menu.Button className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                               <BiDotsHorizontal className="h-6 w-6" />
                             </Menu.Button>
                             <Transition
                               enter="transition ease-out duration-100"
                               enterFrom="transform opacity-0 scale-95"
                               enterTo="transform opacity-100 scale-100"
                               leave="transition ease-in duration-75"
                               leaveFrom="transform opacity-100 scale-100"
                               leaveTo="transform opacity-0 scale-95"
                             >
                               <Menu.Items className="absolute right-0 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                                 <div className="p-1">
                                   <Menu.Item>
                                     {({ active }) => (
                                       <button
                                         className={`${active ? "bg-blue-50 text-blue-700" : "text-gray-700"} flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                         onClick={(e) => handleNavigateToEditStore(e, bodega.id)}
                                         disabled={!userData?.isAdmin}
                                       >
                                          {t("inventory.modify")}
                                       </button>
                                     )}
                                   </Menu.Item>
                                    {userData?.isAdmin && (
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            className={`${active ? "bg-red-50 text-red-700" : "text-red-600"} flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                            onClick={(e) => handleDeleteStore(e, bodega.id)}
                                          >
                                            {t("inventory.delete")}
                                          </button>
                                        )}
                                      </Menu.Item>
                                    )}
                                 </div>
                               </Menu.Items>
                             </Transition>
                           </Menu>
                         </div>
                       </div>
                     </div>
                     <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 mt-auto">
                        <button
                           onClick={(e) => handleNavigateToStorePage(e, bodega.id)}
                           className="text-sm font-medium text-blue-600 hover:text-blue-800 w-full text-left"
                        >
                          {t("inventory.viewInventory")} →
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
             );
           })()}
        </>
      )}
    </div>
  );
};
export default Inventario;
