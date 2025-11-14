// Component Demo - Admin Layout Features
// Showcase all the new features of the redesigned admin portal

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Sparkles,
  Layout,
  Sidebar,
  Palette,
  Zap,
  Check
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, status }) => (
  <Card className="border-gray-200 hover:shadow-lg transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-900">{title}</h3>
            {status === 'completed' && (
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminLayoutDemo = () => {
  const features = [
    {
      icon: Sidebar,
      title: 'Collapsible Sidebar',
      description: 'Sidebar có thể thu gọn/mở rộng với animation mượt mà 500ms, từ 280px xuống 72px. Tooltips xuất hiện khi hover trong collapsed mode.',
      status: 'completed'
    },
    {
      icon: Layout,
      title: 'Apple-Inspired Layout',
      description: 'Thiết kế lấy cảm hứng từ Apple với border-radius lớn (25px), transitions mượt mà, và glassmorphism effects.',
      status: 'completed'
    },
    {
      icon: Palette,
      title: 'Gradient Color Scheme',
      description: 'Purple-blue gradient (#667eea → #764ba2) cho brand identity, shadows tinh tế, và color system nhất quán.',
      status: 'completed'
    },
    {
      icon: Zap,
      title: '60fps Animations',
      description: 'CountUp animations sử dụng requestAnimationFrame, fade-in transitions, và micro-interactions trên mọi elements.',
      status: 'completed'
    },
    {
      icon: Sparkles,
      title: 'Responsive Design',
      description: 'Fully responsive với mobile-first approach, sidebar transforms, và adaptive spacing cho tất cả screen sizes.',
      status: 'completed'
    }
  ];

  return (
    <div className="admin-demo-page">
      <div className="page-header">
        <h1>Admin Portal - New Features</h1>
        <p>Khám phá các tính năng mới của Admin Portal với Staff-style layout</p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>

      {/* Color Palette Demo */}
      <Card className="border-gray-200 mt-8">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Color Palette</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-full h-24 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mb-2"></div>
              <p className="text-sm font-semibold">Brand Gradient</p>
              <p className="text-xs text-gray-500">#667eea → #764ba2</p>
            </div>
            <div className="text-center">
              <div className="w-full h-24 rounded-xl bg-white border border-gray-200 mb-2"></div>
              <p className="text-sm font-semibold">Background</p>
              <p className="text-xs text-gray-500">#ffffff</p>
            </div>
            <div className="text-center">
              <div className="w-full h-24 rounded-xl bg-gray-50 mb-2"></div>
              <p className="text-sm font-semibold">Secondary BG</p>
              <p className="text-xs text-gray-500">#f5f5f7</p>
            </div>
            <div className="text-center">
              <div className="w-full h-24 rounded-xl bg-gray-900 mb-2"></div>
              <p className="text-sm font-semibold">Text Primary</p>
              <p className="text-xs text-gray-500">#1a1a1a</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Demo */}
      <Card className="border-gray-200 mt-8">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Typography Scale</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-extrabold mb-1">Heading 1 - 36px/800</h1>
              <p className="text-sm text-gray-500">Page titles và main headings</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Heading 2 - 24px/700</h2>
              <p className="text-sm text-gray-500">Section titles</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Heading 3 - 20px/600</h3>
              <p className="text-sm text-gray-500">Card titles</p>
            </div>
            <div>
              <p className="text-base mb-1">Body - 16px/400</p>
              <p className="text-sm text-gray-500">Regular body text</p>
            </div>
            <div>
              <p className="text-sm mb-1">Small - 14px/500</p>
              <p className="text-xs text-gray-500">Navigation, labels, captions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacing Demo */}
      <Card className="border-gray-200 mt-8">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Spacing System</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-1 bg-blue-500" style={{height: '4px'}}></div>
              <span className="text-sm font-mono">4px - xs</span>
              <span className="text-xs text-gray-500">Minimal gaps</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 bg-blue-500" style={{height: '8px'}}></div>
              <span className="text-sm font-mono">8px - sm</span>
              <span className="text-xs text-gray-500">Tight spacing</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 bg-blue-500" style={{height: '16px'}}></div>
              <span className="text-sm font-mono">16px - md</span>
              <span className="text-xs text-gray-500">Default spacing</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-6 bg-blue-500" style={{height: '24px'}}></div>
              <span className="text-sm font-mono">24px - lg</span>
              <span className="text-xs text-gray-500">Section gaps</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 bg-blue-500" style={{height: '32px'}}></div>
              <span className="text-sm font-mono">32px - xl</span>
              <span className="text-xs text-gray-500">Major sections</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .admin-demo-page {
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayoutDemo;
