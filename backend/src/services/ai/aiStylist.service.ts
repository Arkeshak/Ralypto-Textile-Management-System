import prisma from '../../db/prisma';
import { StylistRequest, RecommendedOutfit } from './types';

export class AIStylistService {
  async getRecommendations(businessId: string, req: StylistRequest): Promise<{
    outfits: RecommendedOutfit[];
    appliedFilters: { occasion: string; budget: number; availableProductCount: number };
  }> {
    const maxBudget = req.maxBudgetLkr && req.maxBudgetLkr > 0 ? req.maxBudgetLkr : 50000;

    // 1. Query real products from catalogue with variants and active stock
    const products = await prisma.product.findMany({
      where: {
        businessId,
        isActive: true,
      },
      include: {
        category: true,
        brand: true,
        variants: {
          where: { isActive: true },
          include: {
            balances: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (products.length === 0) {
      return {
        outfits: [],
        appliedFilters: { occasion: req.occasion, budget: maxBudget, availableProductCount: 0 },
      };
    }

    // 2. Score and group products into curated outfits based on occasion and harmony
    const occasionLower = (req.occasion || '').toLowerCase();
    const styleLower = (req.preferredStyle || '').toLowerCase();

    // Map occasion to preferred categories & styling vibes
    let primaryCategoryKeywords: string[] = [];
    let occasionTheme = 'Boutique Look';
    let stylingTip = '';

    if (occasionLower.includes('wedding') || occasionLower.includes('reception') || occasionLower.includes('formal')) {
      primaryCategoryKeywords = ['saree', 'ethnic', 'dress', 'gown'];
      occasionTheme = 'Sri Lankan Wedding & Evening Gala';
      stylingTip = 'Pair with metallic gold or antique brass jewellery and delicate kitten heels.';
    } else if (occasionLower.includes('office') || occasionLower.includes('work') || occasionLower.includes('meeting')) {
      primaryCategoryKeywords = ['linen', 'shirt', 'trouser', 'culotte', 'top'];
      occasionTheme = 'Contemporary Colombo Executive';
      stylingTip = 'Elevated comfort tailored in pure breathable linen, perfect for tropical boardroom meetings.';
    } else if (occasionLower.includes('modest') || occasionLower.includes('abaya') || occasionLower.includes('eid')) {
      primaryCategoryKeywords = ['abaya', 'modest', 'dress'];
      occasionTheme = 'Elegance Modest Chic';
      stylingTip = 'Match with a tone-on-tone chiffon hijab and structured tote bag.';
    } else if (occasionLower.includes('avurudu') || occasionLower.includes('festival') || occasionLower.includes('traditional')) {
      primaryCategoryKeywords = ['saree', 'handloom', 'cotton'];
      occasionTheme = 'Festive Heritage Collection';
      stylingTip = 'Accentuate with jasmine flowers and handloom textures reflecting authentic Sri Lankan artistry.';
    } else {
      primaryCategoryKeywords = ['dress', 'linen', 'culotte', 'shirt'];
      occasionTheme = 'Weekend Resort Chic';
      stylingTip = 'Effortless relaxed silhouette ideal for coastal dinners and boutique brunches.';
    }

    // 3. Select primary centerpiece garment
    let primaryGarment = products.find((p) =>
      primaryCategoryKeywords.some(
        (kw) =>
          p.category.name.toLowerCase().includes(kw) ||
          p.name.toLowerCase().includes(kw) ||
          p.category.slug.toLowerCase().includes(kw)
      ) && p.basePrice <= maxBudget
    );

    if (!primaryGarment) {
      primaryGarment = products[0];
    }

    // Find complementary piece (e.g. culottes/trousers or accessories)
    const complementaryGarment = products.find(
      (p) =>
        p.id !== primaryGarment!.id &&
        p.basePrice + primaryGarment!.basePrice <= maxBudget &&
        (p.category.name.toLowerCase().includes('trouser') ||
          p.category.name.toLowerCase().includes('bag') ||
          p.category.name.toLowerCase().includes('culotte') ||
          p.category.name.toLowerCase().includes('accessory'))
    );

    // Build Outfit 1: Signature Thematic Ensemble
    const outfit1Items: any[] = [];
    let outfit1Total = 0;

    if (primaryGarment) {
      const v = primaryGarment.variants[0];
      const stock = v ? v.balances.reduce((a, b) => a + b.quantityOnHand, 0) : 0;
      outfit1Items.push({
        productId: primaryGarment.id,
        productName: primaryGarment.name,
        categoryName: primaryGarment.category.name,
        brandName: primaryGarment.brand?.name || 'Ralypto',
        imageUrl: primaryGarment.imageUrl,
        price: primaryGarment.basePrice,
        recommendedSize: v?.size || 'M',
        recommendedColor: v?.color || 'Emerald',
        inStock: stock > 0,
        availableStock: stock,
        role: 'primary-garment',
        reason: `Perfect centerpiece matching your desired "${req.occasion}" occasion with flattering silhouette.`,
      });
      outfit1Total += primaryGarment.basePrice;
    }

    if (complementaryGarment) {
      const v = complementaryGarment.variants[0];
      const stock = v ? v.balances.reduce((a, b) => a + b.quantityOnHand, 0) : 0;
      outfit1Items.push({
        productId: complementaryGarment.id,
        productName: complementaryGarment.name,
        categoryName: complementaryGarment.category.name,
        brandName: complementaryGarment.brand?.name || 'Ralypto',
        imageUrl: complementaryGarment.imageUrl,
        price: complementaryGarment.basePrice,
        recommendedSize: v?.size || 'Free Size',
        recommendedColor: v?.color || 'Classic',
        inStock: stock > 0,
        availableStock: stock,
        role: 'complementary-piece',
        reason: 'Harmonious color contrast that balances the primary garment.',
      });
      outfit1Total += complementaryGarment.basePrice;
    }

    // Build Outfit 2: Alternative Contemporary Style
    const alternativePrimary = products.find(
      (p) => p.id !== primaryGarment?.id && p.basePrice <= maxBudget
    ) || products[products.length - 1];

    const outfit2Items: any[] = [];
    let outfit2Total = 0;

    if (alternativePrimary) {
      const v = alternativePrimary.variants[0];
      const stock = v ? v.balances.reduce((a, b) => a + b.quantityOnHand, 0) : 0;
      outfit2Items.push({
        productId: alternativePrimary.id,
        productName: alternativePrimary.name,
        categoryName: alternativePrimary.category.name,
        brandName: alternativePrimary.brand?.name || 'Ralypto',
        imageUrl: alternativePrimary.imageUrl,
        price: alternativePrimary.basePrice,
        recommendedSize: v?.size || 'M',
        recommendedColor: v?.color || 'Neutral',
        inStock: stock > 0,
        availableStock: stock,
        role: 'primary-garment',
        reason: `Sleek alternative silhouette tailored for versatile daytime-to-evening wear.`,
      });
      outfit2Total += alternativePrimary.basePrice;
    }

    const outfits: RecommendedOutfit[] = [
      {
        id: `outfit-1-${Date.now()}`,
        title: `${occasionTheme} Look`,
        occasion: req.occasion,
        totalCostLkr: outfit1Total,
        stylingAdvice: stylingTip,
        colorHarmony: 'Rich tropical tones complemented by balanced neutrals.',
        items: outfit1Items,
      },
    ];

    if (outfit2Items.length > 0) {
      outfits.push({
        id: `outfit-2-${Date.now()}`,
        title: 'Modern High-Street Aesthetic',
        occasion: req.occasion,
        totalCostLkr: outfit2Total,
        stylingAdvice: 'Can be dressed down with minimal leather flats or dressed up with statement earrings.',
        colorHarmony: 'Clean, understated palette designed for everyday elegance.',
        items: outfit2Items,
      });
    }

    return {
      outfits,
      appliedFilters: {
        occasion: req.occasion,
        budget: maxBudget,
        availableProductCount: products.length,
      },
    };
  }
}

export const aiStylistService = new AIStylistService();
