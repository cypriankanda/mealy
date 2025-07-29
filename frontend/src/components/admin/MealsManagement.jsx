import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import MealForm from "./MealForm";

const MealsManagement = () => {
  useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      try {
        const response = await api.get("/admin/meals");
        setMeals(response.data);
      } catch (error) {
        console.error("Error fetching meals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const handleCreateMeal = async (mealData) => {
    try {
      const response = await api.post("/admin/meals", mealData);
      setMeals([response.data, ...meals]);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error creating meal:", error);
      throw error.response?.data?.message || "Failed to create meal";
    }
  };

  const handleUpdateMeal = async (mealId, mealData) => {
    try {
      const response = await api.put(`/admin/meals/${mealId}`, mealData);
      setMeals(
        meals.map((meal) => (meal.id === mealId ? response.data : meal))
      );
      setEditingMeal(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error updating meal:", error);
      throw error.response?.data?.message || "Failed to update meal";
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this meal? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/admin/meals/${mealId}`);
        setMeals(meals.filter((meal) => meal.id !== mealId));
      } catch (error) {
        console.error("Error deleting meal:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-green-50 to-blue-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-300/20 to-green-300/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-green-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-orange-300/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
          <div
            className="absolute bottom-10 right-10 w-60 h-60 bg-gradient-to-r from-red-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "6s" }}
          ></div>
          <div
            className="absolute top-50 left-1/4 w-52 h-52 bg-gradient-to-r from-yellow-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "8s" }}
          ></div>
        </div>

        <div className="flex justify-center items-center h-screen relative z-10">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-orange-500 to-green-500 rounded-full"></div>
              <div
                className="absolute inset-2 animate-spin rounded-full border-4 border-transparent bg-gradient-to-r from-green-500 to-orange-500 rounded-full"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              ></div>
            </div>
            <p className="mt-6 text-lg font-medium bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              Loading meals data...
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Please wait while we load your meals
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-green-50 to-blue-50">
      <div className="relative z-10 space-y-8 p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 via-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Meal Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Add, edit, and manage your catering meal offerings.
          </p>
        </div>

        <div
          className="flex justify-end animate-slide-up"
          style={{ animationDelay: "400ms" }}
        >
          <button
            onClick={() => {
              setEditingMeal(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-full shadow-lg text-white 
                       bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 transform hover:scale-105"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add New Meal
          </button>
        </div>

        <div
          className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-4 sm:p-6 animate-slide-up"
          style={{ animationDelay: "500ms" }}
        >
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-6">
            Your Meal Offerings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {meals.length === 0 ? (
              <div className="lg:col-span-3 text-center py-12">
                <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  No meals found.
                </h3>
                <p className="text-gray-400">
                  Click "Add New Meal" to get started!
                </p>
              </div>
            ) : (
              meals.map((meal, index) => (
                <MealItem
                  key={meal.id}
                  meal={meal}
                  onEdit={() => {
                    setEditingMeal(meal);
                    setIsFormOpen(true);
                  }}
                  onDelete={() => handleDeleteMeal(meal.id)}
                  delay={`${600 + index * 50}`}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <MealForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMeal(null);
        }}
        onSubmit={
          editingMeal
            ? (data) => handleUpdateMeal(editingMeal.id, data)
            : handleCreateMeal
        }
        initialData={
          editingMeal || {
            name: "",
            description: "",
            price: "",
            is_active: true,
          }
        }
      />
    </div>
  );
};

const MealItem = ({ meal, onEdit, onDelete, delay }) => {
  return (
    <div
      className={`backdrop-blur-lg bg-white/70 border border-white/20 shadow-xl rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300 animate-slide-up ${
        meal.is_active === false ? "opacity-70 grayscale" : ""
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
            {meal.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{meal.description}</p>
          <p className="text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            KSh {Number(meal.price).toLocaleString("en-KE")}
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center justify-center p-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white 
                       bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-110"
            title="Edit Meal"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center p-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white 
                       bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-110"
            title="Delete Meal"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        {meal.is_active === false ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-4 w-4 mr-1" /> Unavailable
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4 mr-1" /> Available
          </span>
        )}
      </div> */}
    </div>
  );
};

export default MealsManagement;
