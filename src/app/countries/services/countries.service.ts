import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { Observable, combineLatest, delay, flatMap, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';


  private _regions: Region[] = [
    Region.Africa,
    Region.Europe,
    Region.Americas,
    Region.Asia,
    Region.Oceania
  ];

  constructor( private http: HttpClient  ) { }


  get regions(): Region[] {
    return [ ...this._regions ];
  }

  getCountriesByRegion( region: Region ): Observable<SmallCountry[]> {

    if( !region ) return of([]);

    const url:string = `${ this.baseUrl }/region/${ region }?fields=cca3,name,borders`;

    return this.http.get< Country[] >( url )
      .pipe(
        // mapeo de datos RxJS
        map( countries => countries.map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))),
      );

  }

  getCountryByName( nameCountry: string ): Observable< SmallCountry[] >{

    const url: string = `${this.baseUrl}/name/${ nameCountry }?fields=cca3,name,borders`;

    return this.http.get< Country[] >( url )
      .pipe(
        map( countries => countries.map( ({ name, cca3, borders }) => ({
          name: name.common,
          cca3: cca3,
          borders: borders ?? []
        }))),
      )
  }

  getCountryByAlphaCode( alphacode: string ): Observable< SmallCountry > {

    const url: string = `${this.baseUrl}/alpha/${ alphacode }?fields=cca3,name,borders`;

    return this.http.get<Country >(url)
      .pipe(
        map( ({ name, cca3, borders }) => ({
          name: name.common,
          cca3,
          borders: borders ?? []
        })),
      )
  }


  getCountryByBordersByCodes( borders: string[] ): Observable< SmallCountry[] >{
    if( !borders || borders.length === 0 ) return of([]);

    const countriesRquest: Observable< SmallCountry >[] = [];
    // Almacena el listado de observables.
    borders.forEach( code => {
      const request = this.getCountryByAlphaCode( code );
      countriesRquest.push( request );
    });

    // combineLatest -> Todos los observales emiten un valor de manera simultanea.
    return combineLatest( countriesRquest )
  }
}
