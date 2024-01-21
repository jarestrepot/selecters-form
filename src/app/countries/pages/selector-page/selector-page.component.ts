import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { delay, filter, map, mergeMap, switchMap, tap } from 'rxjs';

@Component({
  selector: 'countries-selector-page',
  templateUrl: './selector-page.component.html',
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];
  public spinnerShow: boolean = false;

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required ],
    country: ['', Validators.required ],
    border: ['', Validators.required ]
  });


  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService,
  ){}

  ngOnInit(): void {
    // Listener
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }


  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        tap(() => this.spinnerShow = true ),
        tap( () => this.myForm.get('country')!.setValue('') ), // Clear countries
        tap(() => this.borders = []),
        // ?? Los 2 casos son igual se envia el string de datos.
        // switchMap( this.countriesService.getCountriesByRegion )
        switchMap( (region) => this.countriesService.getCountriesByRegion( region ) ),
      )
      .subscribe({
        next: ( countries ) => {
          this.countriesByRegion = countries;
          this.spinnerShow = false
        },
        error: (error: Error) => console.log(error),
      });
  }


  onCountryChanged(): void{
    this.myForm.get('country')!.valueChanges
      .pipe(
        tap(() => this.spinnerShow = true ),
        tap(() => this.myForm.get('border')!.setValue('')), // Clear borders
        // ?? Los 2 casos son igual se envia el string de datos.
        // switchMap( this.countriesService.getCountriesByRegion )
        filter( ( value:string) => value.length > 0 ),
        switchMap((nameCountry) => this.countriesService.getCountryByName( nameCountry )),
        mergeMap( countries => countries.map( country => country.borders )),
        switchMap( country => this.countriesService.getCountryByBordersByCodes( country ) ),
      )
      .subscribe({
        next: ( countries ) => {
          this.borders = countries;
          this.spinnerShow = false;
        },
        error: (error: Error) => console.log(error),
      });
  }

}
