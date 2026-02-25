"use client";
import React, { useEffect, useState, useCallback } from "react";
import { FaTrash, FaPlus, FaKey } from "react-icons/fa";
import { CompanyData, TeamMember } from "@/interfaces/types";
import Loader from "@/components/Loader/Loader";
import { useAlert } from "@/context/AlertContext";
import CompanyRegistrationForm from "../RegisterCompany";
import { useAppContext } from "@/context/AppContext";
import { PERMISSIONS, PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from "@/constants/permissions";
import { useTranslation } from "react-i18next";

export default function MiEmpresa() {
  const { t } = useTranslation("global");
  const { showAlert } = useAlert();
  const { logout } = useAppContext();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const kazuo_back = process.env.NEXT_PUBLIC_API_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [newMember, setNewMember] = useState<TeamMember>({
    id: "",
    name: "",
    email: "",
    position: "",
  });

  const [editingPermissionsUser, setEditingPermissionsUser] =
    useState<TeamMember | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const userId =
    typeof window !== "undefined" && localStorage.getItem("userData")
      ? JSON.parse(localStorage.getItem("userData") || "{}").id
      : "";

  const userToken =
    typeof window !== "undefined" && localStorage.getItem("userData")
      ? JSON.parse(localStorage.getItem("userData") || "{}").token
      : "";

  const isAdmin =
    typeof window !== "undefined" && localStorage.getItem("userData")
      ? JSON.parse(localStorage.getItem("userData") || "{}").isAdmin
      : false;

  const fetchCompanyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${kazuo_back}/companies/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 401) {
        showAlert({
          title: "Sesión expirada",
          message: "Su sesión ha expirado. Por favor inicie sesión nuevamente.",
          variant: "warning",
          confirmText: "Aceptar",
        }).then(() => {
          logout();
        });
        return;
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setCompanyData(data[0]); // Usamos el primer elemento del arreglo
        if (data[0].users) {
          setTeamMembers(
            data[0].users.map((user: any) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              position: user.isAdmin
                ? t("company.admin")
                : user.position || t("company.member"),
              imgUrl: user.imgUrl,
              isAdmin: user.isAdmin,
              permissions: user.permissions || [],
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error al obtener los datos de la empresa:", error);
      showAlert({
        title: t("company.alerts.errorTitle"),
        message: t("company.alerts.loadError"),
        variant: "danger",
        confirmText: t("company.alerts.accept"),
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, userToken, kazuo_back]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const handleAddTeamMember = async () => {
    try {
      const response = await fetch(
        `${kazuo_back}/companies/${companyData?.id}/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(newMember),
        }
      );
      console.log(userToken);
      console.log(response);

      if (response.status === 401) {
        showAlert({
          title: t("company.alerts.sessionExpiredTitle"),
          message: t("company.alerts.sessionExpiredText"),
          variant: "warning",
          confirmText: t("company.alerts.accept"),
        }).then(() => {
          logout();
        });
        return;
      }

      if (response.ok) {
        setNewMember({ id: "", name: "", email: "", position: "" });

        let message = "Se ha enviado la notificación al correo del usuario.";
        try {
          const text = await response.text();
          if (text) {
            const data = JSON.parse(text);
            if (data.message) message = data.message;
          }
        } catch (e) {
          console.error("Error parsing response", e);
        }

        await fetchCompanyData();

        showAlert({
          title: "¡Operación exitosa!",
          message: message,
          variant: "success",
          confirmText: "Aceptar",
        });
      } else {
        showAlert({
          title: "¡Error!",
          message: "Ocurrió un error al agregar el miembro del equipo.",
          variant: "danger",
          confirmText: "Aceptar",
        });
      }
    } catch (error) {
      console.error("Error al agregar miembro del equipo:", error);
    }
  };

  const handleOpenPermissionsModal = (member: TeamMember) => {
    setEditingPermissionsUser(member);
    setSelectedPermissions(member.permissions || []);
  };

  const handleSavePermissions = async () => {
    if (!editingPermissionsUser) return;

    try {
      const response = await fetch(
        `${kazuo_back}/companies/${companyData?.id}/users/${editingPermissionsUser.id}/permissions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ permissions: selectedPermissions }),
        }
      );

      if (response.ok) {
        setEditingPermissionsUser(null);
        await fetchCompanyData();
        showAlert({
          title: t("company.alerts.successGeneric"),
          message: t("company.alerts.permissionsUpdated"),
          variant: "success",
        });
      } else {
        showAlert({
          title: t("company.alerts.errorTitle"),
          message: t("company.alerts.permissionsError"),
          variant: "danger",
        });
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
      showAlert({
        title: t("company.alerts.errorTitle"),
        message: t("company.alerts.connectionError"),
        variant: "danger",
      });
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleRemoveTeamMember = async (id: string) => {
    const result = await showAlert({
      title: t("company.alerts.confirmDeleteTitle"),
      message: t("company.alerts.confirmDeleteText"),
      variant: "warning",
      showCancelButton: true,
      confirmText: t("company.alerts.confirmDeleteBtn"),
      cancelText: t("company.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${kazuo_back}/companies/${companyData?.id}/users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.ok) {
        setTeamMembers(teamMembers.filter((member) => member.id !== id));
        showAlert({
          title: t("company.alerts.deletedTitle"),
          message: t("company.alerts.deletedText"),
          variant: "success",
        });
        return;
      }

      if (response.status === 409) {
        const errorData = await response.json();
        const { stores, products, providers } = errorData.dependencies || {};

        const action = await showAlert({
          title: t("company.alerts.hasDataTitle"),
          message: (
            <div>
              <p>{t("company.alerts.found")}</p>
              <ul style={{ textAlign: "left", marginLeft: "20px" }}>
                {stores > 0 && <li>{stores} {t("company.alerts.stores")}</li>}
                {products > 0 && <li>{products} {t("company.alerts.products")}</li>}
                {providers > 0 && <li>{providers} {t("company.alerts.providers")}</li>}
              </ul>
              <p>{t("company.alerts.whatToDo")}</p>
            </div>
          ),
          variant: "warning",
          showDenyButton: true,
          showCancelButton: true,
          confirmText: t("company.alerts.migrate"),
          denyText: t("company.alerts.deleteAll"),
          cancelText: t("company.cancel"),
        });

        if (action.isConfirmed) {
          // Migrar
          const { value: email } = await showAlert({
            title: t("company.alerts.enterEmailTitle"),
            input: "email",
            inputLabel: t("company.alerts.emailLabel"),
            inputPlaceholder: t("company.alerts.emailPlaceholder"),
            showCancelButton: true,
            inputValidator: (value) => {
              if (!value) {
                return t("company.alerts.emailRequired");
              }
              return undefined;
            },
          });

          if (email) {
            const migrateResponse = await fetch(
              `${kazuo_back}/companies/${companyData?.id}/users/${id}?migrateToEmail=${email}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${userToken}` },
              }
            );

            if (migrateResponse.ok) {
              setTeamMembers(teamMembers.filter((member) => member.id !== id));
              showAlert({
                title: t("company.alerts.migratedTitle"),
                message: t("company.alerts.migratedText", { email }),
                variant: "success",
              });
            } else {
              const err = await migrateResponse.json();
              showAlert({
                title: t("company.alerts.errorTitle"),
                message: err.message || t("company.alerts.migrateError"),
                variant: "danger",
              });
            }
          }
        } else if (action.isDenied) {
          // Force Delete
          const confirmForce = await showAlert({
            title: t("company.alerts.forceDeleteTitle"),
            message: t("company.alerts.forceDeleteText"),
            variant: "danger",
            showCancelButton: true,
            confirmText: t("company.alerts.forceDeleteBtn"),
            cancelText: t("company.cancel"),
          });

          if (confirmForce.isConfirmed) {
            const forceResponse = await fetch(
              `${kazuo_back}/companies/${companyData?.id}/users/${id}?forceDelete=true`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${userToken}` },
              }
            );

            if (forceResponse.ok) {
              setTeamMembers(teamMembers.filter((member) => member.id !== id));
              showAlert({
                title: t("company.alerts.deletedTitle"),
                message: t("company.alerts.forceDeleteSuccess"),
                variant: "success",
              });
            } else {
              showAlert({
                title: t("company.alerts.errorTitle"),
                message: t("company.alerts.forceDeleteError"),
                variant: "danger",
              });
            }
          }
        }
      } else {
        showAlert({
          title: t("company.alerts.errorTitle"),
          message: t("company.alerts.unexpectedError"),
          variant: "danger",
        });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        title: t("company.alerts.errorTitle"),
        message: t("company.alerts.connectionError"),
        variant: "danger",
      });
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!companyData) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-10">{t("company.title")}</h1>
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            {t("company.noCompanyTitle")}
          </h2>
          <p className="text-center text-gray-600 mb-6">
            {t("company.noCompanyDesc")}
          </p>
          <CompanyRegistrationForm onSuccess={fetchCompanyData} />
        </div>
      </div>
    );
  }

  return (
    <div id="tour-company-section" className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">{t("company.title")}</h1>
      {/* Sección de información de la empresa */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {t("company.infoTitle")}
            </h2>
          </div>

          <div className="p-6 space-y-2">
            <p><span className="font-semibold">{t("company.name")}:</span> {companyData?.CompanyName}</p>
            <p><span className="font-semibold">{t("company.country")}:</span> {companyData?.country}</p>
            <p><span className="font-semibold">{t("company.address")}:</span> {companyData?.address}</p>
            <p><span className="font-semibold">{t("company.phone")}:</span> {companyData?.contactPhone}</p>
            <p><span className="font-semibold">{t("company.email")}:</span> {companyData?.email}</p>
            <p><span className="font-semibold">{t("company.industry")}:</span> {companyData?.industry}</p>
          </div>
        </div>
        {/* Sección de equipo */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              {t("company.teamTitle")}
            </h2>
          </div>
          <div className="p-6">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b last:border-b-0 gap-4"
              >
                <div className="flex items-center">
                  {member.imgUrl ? (
                    <img
                      src={member.imgUrl}
                      alt={member.name}
                      className="w-10 h-10 rounded-full mr-4 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full mr-4 bg-gray-200 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      {member.isAdmin && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">
                          {t("company.admin")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{member.position}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {!member.isAdmin && (
                      <button
                        onClick={() => handleOpenPermissionsModal(member)}
                        className="flex-1 md:flex-none px-3 py-1 bg-white border border-slate-200 text-slate-700 text-sm rounded-xl hover:shadow-md hover:border-transparent hover:bg-gradient-to-r hover:from-sky-500 hover:to-green-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition duration-300 flex items-center justify-center gap-2"
                        title={t("company.managePermissions")}
                      >
                        <FaKey className="inline mr-1" /> {t("company.permissions")}
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveTeamMember(member.id)}
                      className="flex-1 md:flex-none px-3 py-1 bg-white border border-slate-200 text-slate-700 text-sm rounded-xl hover:shadow-md hover:border-transparent hover:bg-gradient-to-r hover:from-sky-500 hover:to-green-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition duration-300 flex items-center justify-center gap-2"
                    >
                      <FaTrash className="inline mr-1" /> {t("company.delete")}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Formulario para agregar miembro */}
            {isAdmin && (
              <div className="mt-6 p-4 border-t">
                <h3 className="font-semibold text-lg mb-4">{t("company.addMemberTitle")}</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={t("company.namePlaceholder")}
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder={t("company.positionPlaceholder")}
                  value={newMember.position}
                  onChange={(e) =>
                    setNewMember({ ...newMember, position: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="email"
                  placeholder={t("company.emailPlaceholder")}
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddTeamMember}
                  className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium shadow-sm hover:shadow-md hover:border-transparent hover:bg-gradient-to-r hover:from-sky-500 hover:to-green-500 hover:text-white transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
                >
                  <FaPlus className="inline mr-2" /> {t("company.addButton")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {editingPermissionsUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold mb-4">
              {t("company.permissionsFor")} {editingPermissionsUser.name}
            </h3>
            <div className="space-y-3 mb-6">
              {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-start">
                  <input
                    type="checkbox"
                    id={key}
                    checked={selectedPermissions.includes(key)}
                    onChange={() => togglePermission(key)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                  />
                  <div className="ml-2">
                    <label
                      htmlFor={key}
                      className="block text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      {label}
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {
                        PERMISSION_DESCRIPTIONS[
                          key as keyof typeof PERMISSION_DESCRIPTIONS
                        ]
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingPermissionsUser(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
              >
                {t("company.cancel")}
              </button>
              <button
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              >
                {t("company.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
