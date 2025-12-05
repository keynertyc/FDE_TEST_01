import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/services/api';
import type { User } from '@/types';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';

interface ClientSearchProps {
  onClientSelect: (clientId: string | null) => void;
  defaultEmail?: string;
  disabled?: boolean;
}

export const ClientSearch = ({ onClientSelect, defaultEmail, disabled }: ClientSearchProps) => {
  const [searchQuery, setSearchQuery] = useState(defaultEmail || '');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const users = await authApi.searchUsers(searchQuery);
        setResults(users);
        setShowResults(true);
      } catch (error) {
        console.error('Failed to search users:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSelectClient = (client: User) => {
    setSelectedClient(client);
    setSearchQuery(client.email);
    setShowResults(false);
    onClientSelect(client.id);
  };

  const handleClearSelection = () => {
    setSelectedClient(null);
    setSearchQuery('');
    setResults([]);
    onClientSelect(null);
  };

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <Label htmlFor="client-search">Client Email (Optional)</Label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="client-search"
            type="text"
            placeholder="Search client by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            disabled={disabled || !!selectedClient}
            className="pl-10 pr-10"
          />
          {selectedClient && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleClearSelection}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showResults && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <ul>
                {results.map((user) => (
                  <li
                    key={user.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSelectClient(user)}
                  >
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No clients found
              </div>
            )}
          </div>
        )}
      </div>
      {selectedClient && (
        <div className="text-sm text-muted-foreground">
          Selected: <span className="font-medium">{selectedClient.name}</span> ({selectedClient.email})
        </div>
      )}
    </div>
  );
};
