import React, { useState, useEffect, useCallback } from 'react';
import { fetchTrendingHashtags } from '../services/geminiService';
import { TrendingHashtagItem, TrendingHashtagsResponse } from '../types';
import { Icon } from './Icon';

interface TrendingHashtagsProps {
  onCreateDraft?: (hashtag: string, creatorTip: string) => void;
  onNavigateToCalendar?: () => void;
}

const CATEGORIES = [
  'Trending Now',
  'Tech & AI',
  'Lifestyle & Vlog',
  'Beauty & Style',
  'Entertainment',
  'Food & Fitness',
];

const TrendingHashtags: React.FC<TrendingHashtagsProps> = ({
  onCreateDraft,
  onNavigateToCalendar,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Trending Now');
  const [searchInput, setSearchInput] = useState<string>('');
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [data, setData] = useState<TrendingHashtagsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [draftedTag, setDraftedTag] = useState<string | null>(null);

  const loadTrends = useCallback(async (category: string, query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchTrendingHashtags(category, query);
      setData(result);
    } catch (err: any) {
      console.error('Error loading trending hashtags:', err);
      setError(
        err?.message ||
          'Unable to retrieve live trending hashtags right now. Please try refreshing.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrends(selectedCategory, activeQuery);
  }, [selectedCategory, activeQuery, loadTrends]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchInput('');
    setActiveQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setActiveQuery('');
      loadTrends(selectedCategory, '');
      return;
    }
    setActiveQuery(searchInput.trim());
  };

  const handleRefresh = () => {
    loadTrends(selectedCategory, activeQuery);
  };

  const handleCopyHashtag = (hashtag: string) => {
    navigator.clipboard.writeText(hashtag);
    setCopiedTag(hashtag);
    setTimeout(() => {
      setCopiedTag((prev) => (prev === hashtag ? null : prev));
    }, 2000);
  };

  const handleCopyAll = () => {
    if (!data?.hashtags?.length) return;
    const allTags = data.hashtags.map((h) => h.hashtag).join(' ');
    navigator.clipboard.writeText(allTags);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDraftWithTrend = (item: TrendingHashtagItem) => {
    if (onCreateDraft) {
      onCreateDraft(item.hashtag, item.creatorTip);
      setDraftedTag(item.hashtag);
      setTimeout(() => {
        setDraftedTag((prev) => (prev === item.hashtag ? null : prev));
      }, 4000);
    }
  };

  const getMomentumStyle = (momentum: TrendingHashtagItem['momentum']) => {
    switch (momentum) {
      case 'Breakout':
        return 'text-tiktok-pink font-semibold';
      case 'Surging':
        return 'text-tiktok-cyan font-semibold';
      case 'Peaking':
        return 'text-emerald-500 font-semibold';
      default:
        return 'text-secondary-text dark:text-dark-text-secondary font-medium';
    }
  };

  const formattedTime = data?.fetchedAt
    ? new Date(data.fetchedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <section className="bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border-color p-6 shadow-sm">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-border-color dark:border-dark-border-color">
        <div>
          <div className="flex items-center gap-2.5">
            <Icon name="trending-up" className="w-6 h-6 text-tiktok-pink flex-shrink-0" />
            <h3 className="text-xl font-bold text-primary-text dark:text-dark-text-primary">
              Trending TikTok Hashtags
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-secondary-text dark:text-dark-text-secondary">
            <span className="flex items-center gap-1.5 text-primary-text dark:text-dark-text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Grounded with live Google Search
            </span>
            <span aria-hidden="true">·</span>
            <span>Real-time topic velocity &amp; creator hooks</span>
            {formattedTime && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">Updated {formattedTime}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {data?.hashtags && data.hashtags.length > 0 && (
            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-border-color dark:border-dark-border-color text-primary-text dark:text-dark-text-primary hover:border-tiktok-cyan hover:text-tiktok-cyan transition-colors whitespace-nowrap"
            >
              <Icon name={copiedAll ? 'check' : 'copy'} className="w-4 h-4" />
              <span>{copiedAll ? 'Copied All 6 Tags' : 'Copy All Tags'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-background dark:bg-dark-card border border-border-color dark:border-dark-border-color text-primary-text dark:text-dark-text-primary hover:border-tiktok-pink hover:text-tiktok-pink disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Icon
              name="refresh"
              className={`w-4 h-4 ${isLoading ? 'animate-spin text-tiktok-pink' : ''}`}
            />
            <span>{isLoading ? 'Syncing Live Trends...' : 'Refresh Live'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls: Category Segmented Bar + Custom Niche Live Search */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 my-5">
        <div
          className="flex items-center gap-1 p-1 bg-background dark:bg-dark-background rounded-lg border border-border-color dark:border-dark-border-color overflow-x-auto"
          role="tablist"
          aria-label="Trend categories"
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category && !activeQuery;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleCategorySelect(category)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-tiktok-pink text-white shadow-sm'
                    : 'text-secondary-text dark:text-dark-text-secondary hover:text-primary-text dark:hover:text-dark-text-primary'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full xl:w-96">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="w-4 h-4 text-secondary-text dark:text-dark-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search niche trends (e.g., cozy gaming, skincare)..."
              aria-label="Search live TikTok trends by niche"
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-background dark:bg-dark-background rounded-lg border border-border-color dark:border-dark-border-color text-primary-text dark:text-dark-text-primary placeholder:text-secondary-text dark:placeholder:text-dark-text-secondary focus:border-tiktok-pink focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-tiktok-pink text-white hover:bg-opacity-90 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 h-9"
          >
            Search Live
          </button>
        </form>
      </div>

      {/* Draft Created Notification Banner */}
      {draftedTag && (
        <div className="mb-5 p-3 rounded-lg bg-background dark:bg-dark-background border border-tiktok-cyan/40 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2 text-primary-text dark:text-dark-text-primary">
            <Icon name="check" className="w-4 h-4 text-tiktok-cyan flex-shrink-0" />
            <span>
              Created a new draft post with <strong>{draftedTag}</strong> and its suggested hook.
            </span>
          </div>
          {onNavigateToCalendar && (
            <button
              type="button"
              onClick={onNavigateToCalendar}
              className="font-semibold text-tiktok-cyan hover:underline whitespace-nowrap ml-4"
            >
              View in Content Calendar &rarr;
            </button>
          )}
        </div>
      )}

      {/* Content Area: Loading Skeleton / Error / Populated Grid */}
      {isLoading ? (
        <div className="space-y-5">
          <div className="h-12 bg-background dark:bg-dark-background rounded-lg animate-pulse border border-border-color dark:border-dark-border-color" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color space-y-3 animate-pulse h-48 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-5 w-1/2 bg-gray-200 dark:bg-dark-card rounded" />
                  <div className="h-3 w-2/3 bg-gray-200 dark:bg-dark-card rounded" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-gray-200 dark:bg-dark-card rounded" />
                  <div className="h-3 w-5/6 bg-gray-200 dark:bg-dark-card rounded" />
                </div>
                <div className="h-7 w-full bg-gray-200 dark:bg-dark-card rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="p-8 rounded-lg bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color text-center space-y-3">
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-tiktok-pink text-white hover:bg-opacity-90 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : data ? (
        <div className="space-y-6 animate-fade-in">
          {/* Trend Pulse Summary */}
          {data.summary && (
            <div className="p-3.5 rounded-lg bg-background dark:bg-dark-background border-l-2 border-tiktok-cyan text-sm text-primary-text dark:text-dark-text-primary flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="leading-relaxed">
                <span className="font-semibold text-tiktok-cyan mr-2">Live Pulse:</span>
                {data.summary}
              </p>
              {activeQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setActiveQuery('');
                  }}
                  className="text-xs text-secondary-text dark:text-dark-text-secondary hover:text-tiktok-pink whitespace-nowrap self-end sm:self-center"
                >
                  Clear search ({activeQuery})
                </button>
              )}
            </div>
          )}

          {/* Hashtags Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.hashtags.map((item, index) => {
              const isCopied = copiedTag === item.hashtag;
              return (
                <article
                  key={`${item.hashtag}-${index}`}
                  className="p-4 rounded-lg bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color hover:border-tiktok-pink/50 transition-colors flex flex-col justify-between gap-4"
                >
                  <div>
                    {/* Top Row: Index + Hashtag Title */}
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-lg font-bold text-primary-text dark:text-dark-text-primary truncate">
                        <span className="text-xs font-mono tabular-nums text-secondary-text dark:text-dark-text-secondary mr-1.5">
                          0{index + 1}.
                        </span>
                        {item.hashtag}
                      </h4>
                      <span
                        className={`text-xs whitespace-nowrap shrink-0 ${getMomentumStyle(
                          item.momentum
                        )}`}
                      >
                        {item.momentum}
                      </span>
                    </div>

                    {/* Unboxed Metadata Line */}
                    <div className="flex items-center gap-1.5 text-xs text-secondary-text dark:text-dark-text-secondary mt-1">
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{item.volumeEstimate}</span>
                    </div>

                    {/* Why It's Trending */}
                    <p className="mt-3 text-sm text-primary-text dark:text-dark-text-primary leading-relaxed">
                      {item.reason}
                    </p>

                    {/* Actionable Creator Hook */}
                    <div className="mt-3 pt-2.5 border-t border-border-color/60 dark:border-dark-border-color/60">
                      <p className="text-xs text-secondary-text dark:text-dark-text-secondary leading-relaxed">
                        <strong className="text-primary-text dark:text-dark-text-primary font-semibold">
                          Creator Hook:{' '}
                        </strong>
                        {item.creatorTip}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Card Footer Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-color dark:border-dark-border-color">
                    <button
                      type="button"
                      onClick={() => handleCopyHashtag(item.hashtag)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border-color text-primary-text dark:text-dark-text-primary hover:border-tiktok-cyan hover:text-tiktok-cyan transition-colors whitespace-nowrap"
                    >
                      <Icon name={isCopied ? 'check' : 'copy'} className="w-3.5 h-3.5" />
                      <span>{isCopied ? 'Copied' : 'Copy Tag'}</span>
                    </button>

                    {onCreateDraft && (
                      <button
                        type="button"
                        onClick={() => handleDraftWithTrend(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-tiktok-pink hover:bg-tiktok-pink/10 transition-colors whitespace-nowrap"
                      >
                        <Icon name="plus" className="w-3.5 h-3.5" />
                        <span>Draft Post</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Google Search Grounding Sources & Citations */}
          {(data.sources.length > 0 || data.searchQueries.length > 0) && (
            <div className="pt-4 border-t border-border-color dark:border-dark-border-color flex flex-col gap-2 text-xs text-secondary-text dark:text-dark-text-secondary">
              {data.sources.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="flex items-center gap-1.5 font-semibold text-primary-text dark:text-dark-text-primary">
                    <Icon name="globe" className="w-3.5 h-3.5 text-tiktok-cyan" />
                    Search Grounding Sources:
                  </span>
                  {data.sources.map((source, idx) => (
                    <React.Fragment key={source.uri}>
                      {idx > 0 && <span aria-hidden="true">·</span>}
                      <a
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-secondary-text dark:text-dark-text-secondary hover:text-tiktok-cyan hover:underline transition-colors max-w-[240px]"
                      >
                        <span className="truncate">{source.title}</span>
                        <Icon name="external-link" className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {data.searchQueries.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-secondary-text/80 dark:text-dark-text-secondary/80">
                  <span className="font-medium">Live queries:</span>
                  <span>{data.searchQueries.slice(0, 4).join(' · ')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
};

export default TrendingHashtags;
