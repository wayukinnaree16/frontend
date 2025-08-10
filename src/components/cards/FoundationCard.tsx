import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Heart, ExternalLink } from 'lucide-react';

interface Foundation {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  province: string;
  foundation_type: string;
  is_verified: boolean;
  wishlist_count?: number;
}

interface FoundationCardProps {
  foundation: Foundation;
  onFavorite?: (foundationId: string) => void;
  isFavorited?: boolean;
}

export const FoundationCard: React.FC<FoundationCardProps> = ({ 
  foundation, 
  onFavorite, 
  isFavorited = false 
}) => {
  return (
    <Card className="group hover:shadow-medium transition-all duration-300 hover:scale-[1.02] overflow-hidden border-0 shadow-soft">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-primary-light to-accent-light overflow-hidden">
          {foundation.logo_url ? (
            <img 
              src={foundation.logo_url} 
              alt={foundation.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Heart className="h-16 w-16 text-primary/30" />
            </div>
          )}
          
          {/* Favorite Button */}
          {onFavorite && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                onFavorite(foundation.id);
              }}
            >
              <Heart 
                className={`h-4 w-4 ${isFavorited ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`}
              />
            </Button>
          )}

          {/* Verified Badge */}
          {foundation.is_verified && (
            <Badge 
              variant="secondary" 
              className="absolute top-3 left-3 bg-accent text-accent-foreground shadow-sm"
            >
              ✓ ยืนยันแล้ว
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {foundation.name}
            </h3>
            <Badge variant="outline" className="ml-2 shrink-0">
              {foundation.foundation_type}
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
            {foundation.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{foundation.province}</span>
            </div>
            {foundation.wishlist_count !== undefined && (
              <div className="text-sm text-muted-foreground">
                {foundation.wishlist_count} รายการต้องการ
              </div>
            )}
          </div>

          <Button asChild className="w-full group" variant="default">
            <Link to={`/foundations/${foundation.id}`}>
              ดูรายละเอียด
              <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};