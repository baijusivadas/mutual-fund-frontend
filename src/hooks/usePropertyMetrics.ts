import { useMemo } from "react";
import type { RentalProperty, Flat, RealEstateProperty } from "@/types";

interface PropertyMetrics {
  occupancyRate: number;
  totalMonthlyRevenue: number;
  totalProperties: number;
  totalPropertyValue: number;
  statusDistribution: { name: string; value: number }[];
  rentalRevenueData: { property: string; revenue: number }[];
  propertyTypeData: { name: string; value: number }[];
  expiringLeases: RentalProperty[];
}

export const usePropertyMetrics = (
  rentalProperties: RentalProperty[],
  flats: Flat[],
  realEstate: RealEstateProperty[]
): PropertyMetrics => {
  return useMemo(() => {
    const totalRentalProperties = rentalProperties.length;
    const occupiedRentalCount = rentalProperties.filter((p) => p.status === "occupied").length;
    const occupancyRate =
      totalRentalProperties > 0 ? (occupiedRentalCount / totalRentalProperties) * 100 : 0;

    const occupiedRentals = rentalProperties.filter((p) => p.status === "occupied");
    const totalMonthlyRevenue = occupiedRentals.reduce(
      (sum, p) => sum + (Number(p.monthly_rent) || 0),
      0
    );

    const totalProperties = totalRentalProperties + flats.length + realEstate.length;
    const totalPropertyValue = [
      ...rentalProperties.map((p) => Number(p.deposit)),
      ...flats.map((p) => Number(p.price)),
      ...realEstate.map((p) => Number(p.price)),
    ].reduce((sum, val) => sum + val, 0);

    const allProperties = [...rentalProperties, ...flats, ...realEstate];
    const statusDistribution = [
      { name: "Available", value: allProperties.filter((p) => p.status === "available").length },
      {
        name: "Occupied/Sold",
        value: allProperties.filter((p) => p.status === "occupied" || p.status === "sold").length,
      },
      {
        name: "Maintenance",
        value: allProperties.filter((p) => p.status === "maintenance").length,
      },
    ].filter((item) => item.value > 0);

    const rentalRevenueData = occupiedRentals
      .map((property) => ({
        property: property.property_name,
        revenue: Number(property.monthly_rent) || 0,
      }))
      .filter((item) => item.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);

    const propertyTypeData = [
      { name: "Rental Properties", value: rentalProperties.length },
      {
        name: "Flats",
        value: flats.length,
      },
      {
        name: "Real Estate",
        value: realEstate.length,
      },
    ];

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiringLeases = rentalProperties.filter((p) => {
      if (!p.lease_end_date) return false;
      const endDate = new Date(p.lease_end_date);
      return endDate >= today && endDate <= thirtyDaysFromNow;
    });

    return {
      occupancyRate,
      totalMonthlyRevenue,
      totalProperties,
      totalPropertyValue,
      statusDistribution,
      rentalRevenueData,
      propertyTypeData,
      expiringLeases,
    };
  }, [rentalProperties, flats, realEstate]);
};
