import { PrismaClient } from '@prisma/client';
import { INITIAL_PHOTOGRAPHERS, INITIAL_BOOKINGS } from '../src/data/photographers';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with MTShoots verified photographers...');

  // 1. Seed Photographers
  for (const p of INITIAL_PHOTOGRAPHERS) {
    await prisma.photographer.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        location: p.location,
        baseCity: p.baseCity,
        officeLocation: p.officeLocation,
        officeAddress: p.officeAddress,
        officeMapUrl: p.officeMapUrl,
        avatar: p.avatar,
        heroImage: p.heroImage,
        primaryCategory: p.primaryCategory,
        specialties: p.specialties,
        experienceLevel: p.experienceLevel,
        experienceYears: p.experienceYears,
        rating: p.rating,
        reviewCount: p.reviewCount,
        dayRate: p.dayRate,
        halfDayRate: p.halfDayRate,
        availableNow: p.availableNow,
        nextAvailableDate: p.nextAvailableDate,
        clientRoster: p.clientRoster,
        bio: p.bio,
        awards: p.awards,
        equipment: p.equipment,
        cameraFormat: p.cameraFormat,
        homeSliderPhotos: p.homeSliderPhotos || [],
        turnaroundDays: p.turnaroundDays,
        assistantIncluded: p.assistantIncluded,
        portfolio: p.portfolio as any,
      },
      create: {
        id: p.id,
        name: p.name,
        location: p.location,
        baseCity: p.baseCity,
        officeLocation: p.officeLocation,
        officeAddress: p.officeAddress,
        officeMapUrl: p.officeMapUrl,
        avatar: p.avatar,
        heroImage: p.heroImage,
        primaryCategory: p.primaryCategory,
        specialties: p.specialties,
        experienceLevel: p.experienceLevel,
        experienceYears: p.experienceYears,
        rating: p.rating,
        reviewCount: p.reviewCount,
        dayRate: p.dayRate,
        halfDayRate: p.halfDayRate,
        availableNow: p.availableNow,
        nextAvailableDate: p.nextAvailableDate,
        clientRoster: p.clientRoster,
        bio: p.bio,
        awards: p.awards,
        equipment: p.equipment,
        cameraFormat: p.cameraFormat,
        homeSliderPhotos: p.homeSliderPhotos || [],
        turnaroundDays: p.turnaroundDays,
        assistantIncluded: p.assistantIncluded,
        portfolio: p.portfolio as any,
      }
    });
    console.log(`  ✓ Seeded photographer: ${p.name} (${p.id})`);
  }

  // 2. Seed Bookings
  for (const b of INITIAL_BOOKINGS) {
    await prisma.booking.upsert({
      where: { id: b.id },
      update: {
        photographerId: b.photographerId,
        photographerName: b.photographerName,
        photographerAvatar: b.photographerAvatar,
        campaignTitle: b.campaignTitle,
        clientBrand: b.clientBrand,
        artDirectorName: b.artDirectorName,
        artDirectorEmail: b.artDirectorEmail,
        shootDate: b.shootDate,
        callTime: b.callTime,
        locationName: b.locationName,
        locationAddress: b.locationAddress,
        durationType: b.durationType,
        usageRights: b.usageRights,
        selectedAddOns: b.selectedAddOns,
        dayRate: b.dayRate,
        durationCost: b.durationCost,
        usageCost: b.usageCost,
        addOnsCost: b.addOnsCost,
        productionFee: b.productionFee,
        totalCost: b.totalCost,
        status: b.status,
        notes: b.notes,
        shotListOverview: b.shotListOverview,
      },
      create: {
        id: b.id,
        photographerId: b.photographerId,
        photographerName: b.photographerName,
        photographerAvatar: b.photographerAvatar,
        campaignTitle: b.campaignTitle,
        clientBrand: b.clientBrand,
        artDirectorName: b.artDirectorName,
        artDirectorEmail: b.artDirectorEmail,
        shootDate: b.shootDate,
        callTime: b.callTime,
        locationName: b.locationName,
        locationAddress: b.locationAddress,
        durationType: b.durationType,
        usageRights: b.usageRights,
        selectedAddOns: b.selectedAddOns,
        dayRate: b.dayRate,
        durationCost: b.durationCost,
        usageCost: b.usageCost,
        addOnsCost: b.addOnsCost,
        productionFee: b.productionFee,
        totalCost: b.totalCost,
        status: b.status,
        notes: b.notes,
        shotListOverview: b.shotListOverview,
      }
    });
    console.log(`  ✓ Seeded sample booking: ${b.campaignTitle} (${b.id})`);
  }

  console.log(`🎉 Seeding complete! Total photographers: ${INITIAL_PHOTOGRAPHERS.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
