import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, AlertCircle, ExternalLink } from 'lucide-react';

interface WishlistItem {
  id: string;
  title: string;
  description: string;
  quantity_needed: number;
  quantity_received: number;
  priority_level: 'low' | 'medium' | 'high' | 'urgent';
  foundation_name?: string;
  foundation_id?: string;
  images?: string[];
  category: string;
}

interface WishlistItemCardProps {
  item: WishlistItem;
  showFoundation?: boolean;
}

export const WishlistItemCard: React.FC<WishlistItemCardProps> = ({ 
  item, 
  showFoundation = true 
}) => {
  const progressPercentage = (item.quantity_received / item.quantity_needed) * 100;
  const isUrgent = item.priority_level === 'urgent';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-secondary text-secondary-foreground';
      case 'medium': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'เร่งด่วน';
      case 'high': return 'สำคัญมาก';
      case 'medium': return 'สำคัญ';
      default: return 'ปกติ';
    }
  };

  return (
    <Card className="group hover:shadow-medium transition-all duration-300 hover:scale-[1.02] overflow-hidden border-0 shadow-soft">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-secondary-light to-primary-light overflow-hidden">
          {item.images && item.images.length > 0 ? (
            <img 
              src={item.images[0]} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-primary/30" />
            </div>
          )}
          
          {/* Priority Badge */}
          <Badge 
            className={`absolute top-3 left-3 shadow-sm ${getPriorityColor(item.priority_level)}`}
          >
            {getPriorityText(item.priority_level)}
          </Badge>

          {/* Urgent Warning */}
          {isUrgent && (
            <div className="absolute top-3 right-3 bg-destructive/90 text-destructive-foreground p-2 rounded-lg shadow-sm">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <Badge variant="outline" className="ml-2 shrink-0">
              {item.category}
            </Badge>
          </div>

          {showFoundation && item.foundation_name && (
            <p className="text-primary text-sm font-medium mb-2">
              {item.foundation_name}
            </p>
          )}

          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
            {item.description}
          </p>

          {/* Progress Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">ความคืบหน้า</span>
              <span className="text-sm text-muted-foreground">
                {item.quantity_received}/{item.quantity_needed} ชิ้น
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              เหลืออีก {item.quantity_needed - item.quantity_received} ชิ้น
            </p>
          </div>

          <Button asChild className="w-full group" variant="default">
            <Link to={`/wishlist/${item.id}`}>
              ดูรายละเอียด
              <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
