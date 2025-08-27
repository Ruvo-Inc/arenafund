/**
 * Local SEO API Route
 * Handles local and industry-specific SEO data, rankings, and performance tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  DEFAULT_GEOGRAPHIC_TARGETS, 
  AI_INDUSTRY_VERTICALS,
  generateLocalBusinessSchema,
  generateIndustrySpecificSchema,
  generateLocationKeywords,
  generateIndustryKeywords,
  optimizeContentForLocation,
  optimizeContentForIndustry,
  generateLocalIndustrySEOData
} from '../../../../lib/local-seo-utils';
import { localSEOTracker } from '../../../../lib/local-seo-performance-tracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'locations':
        return NextResponse.json({
          success: true,
          data: DEFAULT_GEOGRAPHIC_TARGETS
        });

      case 'verticals':
        return NextResponse.json({
          success: true,
          data: AI_INDUSTRY_VERTICALS
        });

      case 'location-keywords':
        const baseKeywords = searchParams.get('keywords')?.split(',') || ['venture capital', 'AI investment'];
        const locationName = searchParams.get('location');
        const location = DEFAULT_GEOGRAPHIC_TARGETS.find(loc => 
          `${loc.city}, ${loc.state}` === locationName
        );
        
        if (!location) {
          return NextResponse.json({
            success: false,
            error: 'Location not found'
          }, { status: 400 });
        }

        const locationKeywords = generateLocationKeywords(baseKeywords, [location]);
        return NextResponse.json({
          success: true,
          data: locationKeywords
        });

      case 'industry-keywords':
        const industryKeywords = generateIndustryKeywords(AI_INDUSTRY_VERTICALS);
        return NextResponse.json({
          success: true,
          data: industryKeywords
        });

      case 'local-schema':
        const schemaLocationName = searchParams.get('location');
        const schemaLocation = DEFAULT_GEOGRAPHIC_TARGETS.find(loc => 
          `${loc.city}, ${loc.state}` === schemaLocationName
        );
        
        if (!schemaLocation) {
          return NextResponse.json({
            success: false,
            error: 'Location not found'
          }, { status: 400 });
        }

        const localSchema = generateLocalBusinessSchema(schemaLocation);
        return NextResponse.json({
          success: true,
          data: JSON.parse(localSchema)
        });

      case 'industry-schema':
        const verticalName = searchParams.get('vertical');
        const vertical = AI_INDUSTRY_VERTICALS.find(v => v.name === verticalName);
        
        if (!vertical) {
          return NextResponse.json({
            success: false,
            error: 'Industry vertical not found'
          }, { status: 400 });
        }

        const industrySchema = generateIndustrySpecificSchema(vertical);
        return NextResponse.json({
          success: true,
          data: JSON.parse(industrySchema)
        });

      case 'rankings':
        const reportTimeframe = searchParams.get('timeframe') as 'weekly' | 'monthly' | 'quarterly' || 'monthly';
        const report = await localSEOTracker.generateLocalSEOReport(reportTimeframe);
        
        return NextResponse.json({
          success: true,
          data: report
        });

      case 'export':
        const exportFormat = searchParams.get('format') as 'json' | 'csv' || 'json';
        const exportData = localSEOTracker.exportPerformanceData(exportFormat);
        
        const headers = new Headers();
        if (exportFormat === 'csv') {
          headers.set('Content-Type', 'text/csv');
          headers.set('Content-Disposition', 'attachment; filename="local-seo-data.csv"');
        } else {
          headers.set('Content-Type', 'application/json');
          headers.set('Content-Disposition', 'attachment; filename="local-seo-data.json"');
        }

        return new NextResponse(exportData, { headers });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Local SEO API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'optimize-location':
        const { content, location: locationName, keywords } = body;
        
        if (!content || !locationName) {
          return NextResponse.json({
            success: false,
            error: 'Content and location are required'
          }, { status: 400 });
        }

        const location = DEFAULT_GEOGRAPHIC_TARGETS.find(loc => 
          `${loc.city}, ${loc.state}` === locationName
        );
        
        if (!location) {
          return NextResponse.json({
            success: false,
            error: 'Location not found'
          }, { status: 400 });
        }

        const locationOptimization = optimizeContentForLocation(
          content, 
          location, 
          keywords || ['venture capital', 'AI investment']
        );
        
        const locationSchema = generateLocalBusinessSchema(location);

        return NextResponse.json({
          success: true,
          data: {
            optimizedContent: locationOptimization.optimizedContent,
            suggestions: locationOptimization.suggestions,
            addedKeywords: locationOptimization.addedKeywords,
            structuredData: JSON.parse(locationSchema)
          }
        });

      case 'optimize-industry':
        const { content: industryContent, vertical: verticalName } = body;
        
        if (!industryContent || !verticalName) {
          return NextResponse.json({
            success: false,
            error: 'Content and vertical are required'
          }, { status: 400 });
        }

        const vertical = AI_INDUSTRY_VERTICALS.find(v => v.name === verticalName);
        
        if (!vertical) {
          return NextResponse.json({
            success: false,
            error: 'Industry vertical not found'
          }, { status: 400 });
        }

        const industryOptimization = optimizeContentForIndustry(industryContent, vertical);
        const industrySchema = generateIndustrySpecificSchema(vertical);

        return NextResponse.json({
          success: true,
          data: {
            optimizedContent: industryOptimization.optimizedContent,
            suggestions: industryOptimization.suggestions,
            addedKeywords: industryOptimization.addedKeywords,
            structuredData: JSON.parse(industrySchema)
          }
        });

      case 'generate-metadata':
        const { title, description, url, location: metaLocation, vertical: metaVertical } = body;
        
        if (!title || !description || !url) {
          return NextResponse.json({
            success: false,
            error: 'Title, description, and URL are required'
          }, { status: 400 });
        }

        let targetLocation, targetVertical;
        
        if (metaLocation) {
          targetLocation = DEFAULT_GEOGRAPHIC_TARGETS.find(loc => 
            `${loc.city}, ${loc.state}` === metaLocation
          );
        }
        
        if (metaVertical) {
          targetVertical = AI_INDUSTRY_VERTICALS.find(v => v.name === metaVertical);
        }

        const metadata = generateLocalIndustrySEOData({
          baseTitle: title,
          baseDescription: description,
          location: targetLocation,
          vertical: targetVertical,
          url
        });

        return NextResponse.json({
          success: true,
          data: metadata
        });

      case 'track-rankings':
        const { keywords: trackKeywords, locations, industries } = body;
        
        if (!trackKeywords || (!locations && !industries)) {
          return NextResponse.json({
            success: false,
            error: 'Keywords and either locations or industries are required'
          }, { status: 400 });
        }

        const results: any = {};

        if (locations && locations.length > 0) {
          const localRankings = await localSEOTracker.trackLocalRankings(trackKeywords, locations);
          results.localRankings = localRankings;
        }

        if (industries && industries.length > 0) {
          const industryRankings = await localSEOTracker.trackIndustryRankings(trackKeywords, industries);
          results.industryRankings = industryRankings;
        }

        return NextResponse.json({
          success: true,
          data: results
        });

      case 'generate-report':
        const { timeframe = 'monthly' } = body;
        const performanceReport = await localSEOTracker.generateLocalSEOReport(timeframe);
        
        return NextResponse.json({
          success: true,
          data: performanceReport
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Local SEO API POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'update-location-config':
        // In a real implementation, this would update stored configuration
        const { locations, enabled } = body;
        
        return NextResponse.json({
          success: true,
          message: 'Location configuration updated',
          data: { locations, enabled }
        });

      case 'update-industry-config':
        // In a real implementation, this would update stored configuration
        const { verticals, enabled: industryEnabled } = body;
        
        return NextResponse.json({
          success: true,
          message: 'Industry configuration updated',
          data: { verticals, enabled: industryEnabled }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Local SEO API PUT error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'clear-rankings':
        // In a real implementation, this would clear stored ranking data
        return NextResponse.json({
          success: true,
          message: 'Ranking data cleared'
        });

      case 'clear-reports':
        // In a real implementation, this would clear stored reports
        return NextResponse.json({
          success: true,
          message: 'Report data cleared'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Local SEO API DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}