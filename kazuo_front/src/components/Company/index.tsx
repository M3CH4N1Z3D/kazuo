"use client";
import React, { useEffect, useState, useCallback } from "react";
import { FaTrash, FaPlus, FaKey } from "react-icons/fa";
import { CompanyData, TeamMember } from "@/interfaces/types";
import Loader from "@/components/Loader/Loader";
import Swal from "sweetalert2";
import CompanyRegistrationForm from "../RegisterCompany";
import { useAppContext } from "@/context/AppContext";
import { PERMISSIONS, PERMISSION_LABELS } from "@/constants/permissions";

export default function MiEmpresa() {
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
        Swal.fire({
          title: "Sesión expirada",
          text: "Su sesión ha expirado. Por favor inicie sesión nuevamente.",
          icon: "warning",
          confirmButtonText: "Aceptar",
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
                ? "Administrador"
                : user.position || "Miembro del equipo",
              imgUrl: user.imgUrl,
              isAdmin: user.isAdmin,
              permissions: user.permissions || [],
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error al obtener los datos de la empresa:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo cargar la información de la empresa.",
        icon: "error",
        confirmButtonText: "Aceptar",
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
        Swal.fire({
          title: "Sesión expirada",
          text: "Su sesión ha expirado. Por favor inicie sesión nuevamente.",
          icon: "warning",
          confirmButtonText: "Aceptar",
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

        Swal.fire({
          title: "¡Operación exitosa!",
          text: message,
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      } else {
        Swal.fire({
          title: "¡Error!",
          text: "Ocurrió un error al agregar el miembro del equipo.",
          icon: "error",
          confirmButtonText: "Aceptar",
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
        Swal.fire(
          "¡Éxito!",
          "Permisos actualizados correctamente.",
          "success"
        );
      } else {
        Swal.fire(
          "Error",
          "No se pudieron actualizar los permisos.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
      Swal.fire("Error", "Error de conexión", "error");
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
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se eliminará el usuario. Si tiene datos asociados, se te pedirá confirmar qué hacer con ellos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
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
        Swal.fire("¡Eliminado!", "El usuario ha sido eliminado.", "success");
        return;
      }

      if (response.status === 409) {
        const errorData = await response.json();
        const { stores, products, providers } = errorData.dependencies || {};

        const action = await Swal.fire({
          title: "El usuario tiene datos asociados",
          html: `
            <p>Se encontraron:</p>
            <ul style="text-align: left; margin-left: 20px;">
              ${stores > 0 ? `<li>${stores} Tiendas</li>` : ""}
              ${products > 0 ? `<li>${products} Productos</li>` : ""}
              ${providers > 0 ? `<li>${providers} Proveedores</li>` : ""}
            </ul>
            <p>¿Qué deseas hacer?</p>
          `,
          icon: "warning",
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: "Migrar Datos",
          denyButtonText: "Eliminar Todo",
          cancelButtonText: "Cancelar",
        });

        if (action.isConfirmed) {
          // Migrar
          const { value: email } = await Swal.fire({
            title: "Ingrese el correo del nuevo dueño",
            input: "email",
            inputLabel: "Correo electrónico",
            inputPlaceholder: "nuevo@correo.com",
            showCancelButton: true,
            inputValidator: (value) => {
              if (!value) {
                return "Debes escribir un correo!";
              }
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
              Swal.fire(
                "¡Migrado!",
                `Datos migrados a ${email} y usuario eliminado.`,
                "success"
              );
            } else {
              const err = await migrateResponse.json();
              Swal.fire("Error", err.message || "Error al migrar", "error");
            }
          }
        } else if (action.isDenied) {
          // Force Delete
          const confirmForce = await Swal.fire({
            title: "¿Estás absolutamente seguro?",
            text: "Esta acción no se puede deshacer. Se eliminarán todas las tiendas, productos y relaciones del usuario.",
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar todo",
            cancelButtonText: "Cancelar",
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
              Swal.fire(
                "¡Eliminado!",
                "Usuario y todos sus datos eliminados.",
                "success"
              );
            } else {
              Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
            }
          }
        }
      } else {
        Swal.fire("Error", "Ocurrió un error inesperado", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Error de conexión", "error");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!companyData) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-10">Mi Empresa</h1>
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Aún no tienes una empresa registrada
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Para gestionar miembros y acceder a todas las funciones, por favor
            registra tu empresa.
          </p>
          <CompanyRegistrationForm onSuccess={fetchCompanyData} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Mi Empresa</h1>
      {/* Sección de información de la empresa */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Información de la Empresa
            </h2>
          </div>

          <div className="p-6">
            <p>Nombre: {companyData?.CompanyName}</p>
            <p>País: {companyData?.country}</p>
            <p>Dirección: {companyData?.address}</p>
            <p>Teléfono: {companyData?.contactPhone}</p>
            <p>Email: {companyData?.email}</p>
            <p>Industria: {companyData?.industry}</p>
          </div>
        </div>
        {/* Sección de equipo */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Nuestro Equipo
            </h2>
          </div>
          <div className="p-6">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border-b last:border-b-0"
              >
                <div className="flex items-center">
                  {member.imgUrl ? (
                    <img
                      src={member.imgUrl}
                      alt={member.name}
                      className="w-10 h-10 rounded-full mr-4 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full mr-4 bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center">
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      {member.isAdmin && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{member.position}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex space-x-2">
                    {!member.isAdmin && (
                      <button
                        onClick={() => handleOpenPermissionsModal(member)}
                        className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition duration-300"
                        title="Gestionar Permisos"
                      >
                        <FaKey className="inline mr-1" /> Permisos
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveTeamMember(member.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-300"
                    >
                      <FaTrash className="inline mr-1" /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Formulario para agregar miembro */}
            {isAdmin && (
              <div className="mt-6 p-4 border-t">
                <h3 className="font-semibold text-lg mb-4">Agregar Miembro</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Posición"
                  value={newMember.position}
                  onChange={(e) =>
                    setNewMember({ ...newMember, position: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddTeamMember}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
                >
                  <FaPlus className="inline mr-2" /> Agregar Miembro
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
              Permisos para {editingPermissionsUser.name}
            </h3>
            <div className="space-y-3 mb-6">
              {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    checked={selectedPermissions.includes(key)}
                    onChange={() => togglePermission(key)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={key}
                    className="ml-2 block text-sm text-gray-900 cursor-pointer"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingPermissionsUser(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
